import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  ArrowLeft,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Users,
  RefreshCw,
  Save,
  Info,
  AlertCircle
} from 'lucide-react';
import { createServerSupabase } from '~/utils/supabase.server';
import { isOrganiser } from '~/utils/currentUser';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { MainNav } from '~/components/main-nav';
import { PageTransition } from '~/components/page-transition';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    throw new Response('Unauthorized', { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Get current user
  const { data: { user } } = await supabase.client.auth.getUser();

  // Fetch all clans for selection
  const { data: clans } = await supabase.client
    .from('clans')
    .select('*')
    .order('clan_name');

  return json({
    user,
    organiserStatus,
    clans: clans || []
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const formData = await request.formData();
  const action = formData.get('action');

  try {
    switch (action) {
      case 'validate_csv': {
        const csvData = formData.get('csvData') as string;
        const results = await validateCsvData(csvData, supabase);
        return json({ success: true, validationResults: results });
      }

      case 'import_members': {
        const membersData = JSON.parse(formData.get('membersData') as string);
        const results = await importMembers(membersData, supabase);
        
        if (results.errors.length > 0) {
          return json({ 
            success: false, 
            importResults: results,
            message: `Import completed with ${results.errors.length} errors`
          });
        }

        return redirect('/admin/members?success=bulk-imported');
      }

      case 'download_template': {
        const template = generateCsvTemplate();
        return json({ success: true, template });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Bulk import error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
};

// CSV validation function
async function validateCsvData(csvData: string, supabase: any) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const requiredHeaders = ['name', 'github_username', 'title'];
  const optionalHeaders = ['discord_username', 'personal_email', 'mobile_number', 'clan_name', 'bash_points'];
  
  const validationResults: ValidationResult = {
    valid: [],
    errors: [] as { row: number; data?: any; message: string }[],
    warnings: [],
    duplicates: [],
    headerValid: true,
    totalRows: lines.length - 1
  };

  // Validate headers
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  if (missingHeaders.length > 0) {
    validationResults.headerValid = false;
    validationResults.errors.push({
      row: 0,
      message: `Missing required headers: ${missingHeaders.join(', ')}`
    });
    return validationResults;
  }

  // Check for existing members
  const { data: existingMembers } = await supabase.client
    .from('members')
    .select('github_username, discord_username');

  const existingGithubUsernames = new Set(existingMembers?.map((m: any) => m.github_username.toLowerCase()) || []);
  const existingDiscordUsernames = new Set(existingMembers?.map((m: any) => m.discord_username?.toLowerCase()).filter(Boolean) || []);

  // Track duplicates within the CSV
  const csvGithubUsernames = new Set();
  const csvDiscordUsernames = new Set();

  // Validate each row
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const rowErrors: string[] = [];
    const rowWarnings: string[] = [];

    // Required field validation
    if (!row.name) rowErrors.push('Name is required');
    if (!row.github_username) rowErrors.push('GitHub username is required');
    if (!row.title) rowErrors.push('Title is required');

    // GitHub username validation
    if (row.github_username) {
      const githubLower = row.github_username.toLowerCase();
      if (existingGithubUsernames.has(githubLower)) {
        rowErrors.push('GitHub username already exists in database');
      }
      if (csvGithubUsernames.has(githubLower)) {
        rowErrors.push('Duplicate GitHub username in CSV');
      }
      csvGithubUsernames.add(githubLower);
    }

    // Discord username validation
    if (row.discord_username) {
      const discordLower = row.discord_username.toLowerCase();
      if (existingDiscordUsernames.has(discordLower)) {
        rowErrors.push('Discord username already exists in database');
      }
      if (csvDiscordUsernames.has(discordLower)) {
        rowErrors.push('Duplicate Discord username in CSV');
      }
      csvDiscordUsernames.add(discordLower);
    }

    // Email validation
    if (row.personal_email && !isValidEmail(row.personal_email)) {
      rowErrors.push('Invalid email format');
    }

    // Role validation
    const validRoles = ['Basher', 'Captain Bash', 'Organiser', 'Mentor', 'Legacy Basher', 'Rookie', 'Null Basher'];
    if (row.title && !validRoles.includes(row.title)) {
      rowErrors.push(`Invalid role: ${row.title}. Valid roles: ${validRoles.join(', ')}`);
    }

    // Points validation
    if (row.bash_points && (isNaN(Number(row.bash_points)) || Number(row.bash_points) < 0)) {
      rowErrors.push('Bash points must be a positive number');
    }

    if (rowErrors.length > 0) {
      validationResults.errors.push({
        row: i,
        data: row,
        message: rowErrors.join('; ')
      });
    } else {
      if (rowWarnings.length > 0) {
        validationResults.warnings.push({
          row: i,
          data: row,
          message: rowWarnings.join('; ')
        });
      }
      validationResults.valid.push({
        row: i,
        data: row
      });
    }
  }

  return validationResults;
}

// Import members function
async function importMembers(membersData: any[], supabase: any) {
  const results: {
    successful: any[];
    errors: { data: any; error: string }[];
    totalProcessed: number;
  } = {
    successful: [],
    errors: [],
    totalProcessed: membersData.length
  };

  for (const memberData of membersData) {
    try {
      // Fetch clan ID if clan_name is provided
      let clanId = null;
      if (memberData.clan_name) {
        const { data: clan } = await supabase.client
          .from('clans')
          .select('id')
          .ilike('clan_name', memberData.clan_name)
          .single();
        clanId = clan?.id || null;
      }

      // Fetch GitHub avatar
      let avatarUrl = `https://github.com/${memberData.github_username}.png`;
      try {
        const githubResponse = await fetch(`https://api.github.com/users/${memberData.github_username}`);
        if (githubResponse.ok) {
          const githubData = await githubResponse.json();
          avatarUrl = githubData.avatar_url;
        }
      } catch (error) {
        console.warn('Failed to fetch GitHub avatar:', error);
      }

      // Insert member
      const { data: newMember, error } = await supabase.client
        .from('members')
        .insert({
          name: memberData.name,
          github_username: memberData.github_username,
          discord_username: memberData.discord_username || null,
          title: memberData.title,
          clan_id: clanId,
          personal_email: memberData.personal_email || null,
          mobile_number: memberData.mobile_number || null,
          bash_points: Number(memberData.bash_points) || 0,
          avatar_url: avatarUrl,
          joined_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        results.errors.push({
          data: memberData,
          error: error.message
        });
      } else {
        results.successful.push(newMember);
      }
    } catch (error) {
      results.errors.push({
        data: memberData,
        error: (error as Error).message
      });
    }
  }

  return results;
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateCsvTemplate(): string {
  const headers = [
    'name',
    'github_username',
    'title',
    'discord_username',
    'personal_email',
    'mobile_number',
    'clan_name',
    'bash_points'
  ];
  
  const sampleRows = [
    'John Doe,johndoe,Basher,johndoe#1234,john@example.com,+1234567890,Alpha Clan,0',
    'Jane Smith,janesmith,Captain Bash,janesmith#5678,jane@example.com,+0987654321,Beta Clan,100',
    'Bob Wilson,bobwilson,Mentor,,bob@example.com,,Gamma Clan,500'
  ];

  return [headers.join(','), ...sampleRows].join('\n');
}

interface ValidationResult {
  valid: { row: number; data: any }[];
  errors: { row: number; data?: any; message: string }[];
  warnings: { row: number; data?: any; message: string }[];
  duplicates: any[];
  headerValid: boolean;
  totalRows: number;
}

type ActionData = {
  success?: boolean;
  validationResults?: ValidationResult;
  importResults?: {
    successful: any[];
    errors: { data: any; error: string }[];
    totalProcessed: number;
  };
  error?: string;
  template?: string;
};

export default function BulkAddMembers() {
  const { user, clans } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  
  const [csvData, setCsvData] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'validate' | 'import'>('upload');

  const isProcessing = fetcher.state === 'submitting';
  const actionData = fetcher.data as ActionData;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
        setCurrentStep('validate');
      };
      reader.readAsText(file);
    }
  };

  const handleValidation = () => {
    if (!csvData) return;
    
    const formData = new FormData();
    formData.append('action', 'validate_csv');
    formData.append('csvData', csvData);
    fetcher.submit(formData, { method: 'post' });
  };

  const handleImport = () => {
    if (!validationResults?.valid) return;
    
    const validMembers = validationResults.valid.map(item => item.data);
    const formData = new FormData();
    formData.append('action', 'import_members');
    formData.append('membersData', JSON.stringify(validMembers));
    fetcher.submit(formData, { method: 'post' });
  };

  const downloadTemplate = () => {
    const formData = new FormData();
    formData.append('action', 'download_template');
    fetcher.submit(formData, { method: 'post' });
  };

  // Handle validation results
  if (actionData?.validationResults && !validationResults) {
    setValidationResults(actionData.validationResults);
    setCurrentStep('import');
  }

  // Handle template download
  if (actionData?.template) {
    const blob = new Blob([actionData.template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin/members"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Member Management
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Bulk Import Members
            </h1>
            <p className="text-gray-400 mt-2">
              Import multiple members from a CSV file
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-blue-400' : 'text-green-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'upload' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {currentStep === 'upload' ? '1' : <CheckCircle className="w-5 h-5" />}
                </div>
                <span>Upload CSV</span>
              </div>
              
              <div className={`h-px flex-1 ${currentStep !== 'upload' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              
              <div className={`flex items-center gap-2 ${
                currentStep === 'validate' ? 'text-blue-400' : 
                currentStep === 'import' ? 'text-green-400' : 'text-gray-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'validate' ? 'bg-blue-500' : 
                  currentStep === 'import' ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {currentStep === 'import' ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span>Validate Data</span>
              </div>
              
              <div className={`h-px flex-1 ${currentStep === 'import' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              
              <div className={`flex items-center gap-2 ${currentStep === 'import' ? 'text-blue-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'import' ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  3
                </div>
                <span>Import Members</span>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {actionData?.error && (
            <Alert className="mb-6 border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                {actionData.error}
              </AlertDescription>
            </Alert>
          )}

          {actionData?.importResults && (
            <Alert className={`mb-6 ${
              actionData.importResults.errors.length > 0 
                ? 'border-yellow-500/50 bg-yellow-500/10' 
                : 'border-green-500/50 bg-green-500/10'
            }`}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className={actionData.importResults.errors.length > 0 ? 'text-yellow-400' : 'text-green-400'}>
                Import completed: {actionData.importResults.successful.length} successful, {actionData.importResults.errors.length} failed
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Upload CSV */}
              {currentStep === 'upload' && (
                <Card className="bg-white/5 border-gray-700 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload CSV File
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csvFile" className="text-sm font-medium">
                        Select CSV File
                      </Label>
                      <Input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="bg-white/10 border-gray-600 mt-1"
                      />
                    </div>

                    <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Drop your CSV file here or click to browse
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={downloadTemplate}
                        variant="outline"
                        className="border-gray-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 2: Manual CSV Input (if no file) */}
              {currentStep === 'validate' && (
                <Card className="bg-white/5 border-gray-700 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    CSV Data
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csvData" className="text-sm font-medium">
                        CSV Content
                      </Label>
                      <Textarea
                        id="csvData"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                        className="bg-white/10 border-gray-600 mt-1 font-mono text-sm"
                        rows={10}
                        placeholder="name,github_username,title,discord_username,personal_email,mobile_number,clan_name,bash_points"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleValidation}
                        disabled={!csvData || isProcessing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Validate Data
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => {
                          setCsvData('');
                          setCurrentStep('upload');
                        }}
                        variant="outline"
                        className="border-gray-600"
                      >
                        Start Over
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 3: Validation Results & Import */}
              {currentStep === 'import' && validationResults && (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card className="bg-white/5 border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Validation Results
                    </h2>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {validationResults.valid.length}
                        </div>
                        <div className="text-sm text-gray-400">Valid Records</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {validationResults.errors.length}
                        </div>
                        <div className="text-sm text-gray-400">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {validationResults.warnings.length}
                        </div>
                        <div className="text-sm text-gray-400">Warnings</div>
                      </div>
                    </div>

                    {validationResults.valid.length > 0 && (
                      <div className="flex gap-4">
                        <Button
                          onClick={handleImport}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Import {validationResults.valid.length} Members
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => setShowPreview(!showPreview)}
                          variant="outline"
                          className="border-gray-600"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {showPreview ? 'Hide' : 'Show'} Preview
                        </Button>
                      </div>
                    )}
                  </Card>

                  {/* Errors */}
                  {validationResults.errors.length > 0 && (
                    <Card className="bg-red-500/10 border-red-500/30 p-6">
                      <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Errors ({validationResults.errors.length})
                      </h3>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {validationResults.errors.map((error, index) => (
                          <div key={index} className="bg-red-500/20 rounded p-3">
                            <div className="text-sm font-medium">Row {error.row}</div>
                            <div className="text-xs text-red-300 mt-1">{error.message}</div>
                            {error.data && (
                              <div className="text-xs text-gray-400 mt-1">
                                Data: {JSON.stringify(error.data)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Preview Table */}
                  {showPreview && validationResults.valid.length > 0 && (
                    <Card className="bg-white/5 border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Preview Valid Records
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>GitHub</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Discord</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Clan</TableHead>
                              <TableHead>Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {validationResults.valid.slice(0, 5).map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.data.name}</TableCell>
                                <TableCell>{item.data.github_username}</TableCell>
                                <TableCell>
                                  <Badge className="bg-blue-500 text-white">
                                    {item.data.title}
                                  </Badge>
                                </TableCell>
                                <TableCell>{item.data.discord_username || '-'}</TableCell>
                                <TableCell>{item.data.personal_email || '-'}</TableCell>
                                <TableCell>{item.data.clan_name || '-'}</TableCell>
                                <TableCell>{item.data.bash_points || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {validationResults.valid.length > 5 && (
                          <div className="text-center text-gray-400 text-sm mt-2">
                            ... and {validationResults.valid.length - 5} more records
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CSV Format Guide */}
              <Card className="bg-blue-500/10 border-blue-500/30 p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400">
                  <Info className="w-5 h-5" />
                  CSV Format Guide
                </h3>
                
                <div className="space-y-3 text-sm text-blue-200">
                  <div>
                    <strong>Required Columns:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• name</li>
                      <li>• github_username</li>
                      <li>• title</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>Optional Columns:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• discord_username</li>
                      <li>• personal_email</li>
                      <li>• mobile_number</li>
                      <li>• clan_name</li>
                      <li>• bash_points</li>
                    </ul>
                  </div>

                  <div>
                    <strong>Valid Roles:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Basher</li>
                      <li>• Captain Bash</li>
                      <li>• Organiser</li>
                      <li>• Mentor</li>
                      <li>• Legacy Basher</li>
                      <li>• Rookie</li>
                      <li>• Null Basher</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Tips */}
              <Card className="bg-green-500/10 border-green-500/30 p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Import Tips
                </h3>
                
                <ul className="text-sm text-green-200 space-y-2">
                  <li>• GitHub usernames are case-sensitive</li>
                  <li>• Discord usernames should include discriminator (#1234)</li>
                  <li>• Clan names will be matched automatically</li>
                  <li>• Duplicate entries will be rejected</li>
                  <li>• Import can be resumed if errors occur</li>
                  <li>• All members start with 0 points unless specified</li>
                </ul>
              </Card>

              {/* Available Clans */}
              {clans.length > 0 && (
                <Card className="bg-white/5 border-gray-700 p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Available Clans
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    {clans.map((clan: any) => (
                      <div key={clan.id} className="flex justify-between">
                        <span>{clan.clan_name}</span>
                        <span className="text-gray-400">{clan.clan_score} pts</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
