import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { motion } from 'framer-motion';
import { BadgeCheck, ChevronRight, XCircle, CheckCircle, UserRound } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { safeFetcherData } from '~/types/fetcher';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import { Badge } from '~/components/ui/badge';

interface RollNumberUpdateProps {
  hasRollNumber: boolean;
  rollNumber?: string;
  memberId?: number;
}

export default function RollNumberUpdate({
  hasRollNumber,
  rollNumber,
  memberId,
}: RollNumberUpdateProps) {
  // Validate if the roll number matches our patterns
  const csPatternWithSection = /^(22|23|24)RU[A-Z]{2}[A-Z]\d{3}$/;
  const aiPattern = /^(22|23|24)RUAI\d{3}$/;
  
  // Determine if roll number matches the required format
  const isValidRollNumber = rollNumber ? 
    (csPatternWithSection.test(rollNumber) || aiPattern.test(rollNumber)) : false;
  
  // Check if the number part is valid (doesn't exceed 65)
  const isValidNumberPart = rollNumber && rollNumber.length >= 3 ? 
    parseInt(rollNumber.substring(rollNumber.length - 3)) <= 65 : false;
  
  // Determine if the roll number is actually verified (exists and passes validation)
  const isVerified = hasRollNumber && isValidRollNumber && isValidNumberPart;
  
  // For dummy roll numbers that exist in DB but don't meet format requirements
  const hasDummyRollNumber = hasRollNumber && rollNumber && !isVerified;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [studentRollNumber, setStudentRollNumber] = useState(rollNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetcher = useFetcher();

  // Handle API response
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      setIsSubmitting(false);
      
      const fetcherData = safeFetcherData(fetcher.data);
      
      if (fetcherData.success) {
        setSuccessMessage(fetcherData.message || 'Roll number successfully updated!');
        
        // Close dialog after success
        setTimeout(() => {
          setIsDialogOpen(false);
          
          // Force a page refresh to update the UI with new roll number
          window.location.reload();
        }, 2000);
      } else if (fetcherData.error) {
        setValidationError(fetcherData.error);
      }
    }
  }, [fetcher.data, fetcher.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationError('');
    setSuccessMessage('');

    // Validate roll number formats:
    // CS dept: 22RUCSA020 - Year(2) + RU + Dept(2) + Section(1) + Number(3)
    // AI dept: 23RUAI039 - Year(2) + RU + Dept(2) + Number(3)
    const csPatternWithSection = /^(22|23|24)RU[A-Z]{2}[A-Z]\d{3}$/;
    const aiPattern = /^(22|23|24)RUAI\d{3}$/;
    
    if (!csPatternWithSection.test(studentRollNumber) && !aiPattern.test(studentRollNumber)) {
      setValidationError('Please enter a valid roll number (e.g., 22RUCSA020 or 23RUAI039)');
      setIsSubmitting(false);
      return;
    }
    
    // Check if number part doesn't exceed 65
    const numberPart = parseInt(studentRollNumber.substring(studentRollNumber.length - 3));
    if (numberPart > 65) {
      setValidationError('Roll number sequence should not exceed 065');
      setIsSubmitting(false);
      return;
    }

    // Submit the update via fetcher
    fetcher.submit(
      {
        roll_number: studentRollNumber,
        member_id: memberId?.toString() || '',
      },
      { method: 'post', action: '/api/update-roll-number' }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }} // Slight delay after LeetCodeConnect for a staggered effect
      className="mb-0"
    >
      <div
        className={`rounded-xl p-4 flex items-center justify-between ${
          isVerified
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isVerified ? 'bg-green-500/20' : 'bg-blue-500/20'
            }`}
          >
            <UserRound
              className={`h-5 w-5 ${
                isVerified ? 'text-green-400' : 'text-blue-400'
              }`}
            />
          </div>
          <div>
            <h3 className="font-medium">
              {isVerified 
                ? 'Roll Number Verified' 
                : hasDummyRollNumber 
                  ? 'Invalid Roll Number Format'
                  : 'Verify Roll Number'}
            </h3>
            <p className="text-sm text-gray-400">
              {isVerified
                ? 'Your college roll number is verified'
                : hasRollNumber && rollNumber
                  ? 'Your roll number needs to be updated'
                  : 'Add your college roll number for verification'}
            </p>
          </div>
        </div>

        <Button
          variant={isVerified ? 'ghost' : 'outline'}
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className={isVerified ? 'text-green-400' : 'text-blue-400'}
        >
          {isVerified ? 'View' : hasRollNumber && rollNumber ? 'Update' : 'Add'}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-blue-400" />
              {isVerified
                ? 'Your College Roll Number'
                : hasDummyRollNumber
                  ? 'Invalid Roll Number Format' 
                  : 'Verify Your College Roll Number'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isVerified
                ? 'Your college roll number is verified and linked to your profile'
                : hasDummyRollNumber
                  ? `Your current roll number "${rollNumber}" doesn't meet the format requirements`
                  : 'Add your college roll number to verify your academic identity'}
            </DialogDescription>
          </DialogHeader>

          {!isVerified ? (
            hasDummyRollNumber ? (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-amber-400" />
                    <h4 className="font-medium">Invalid Roll Number Format</h4>
                  </div>
                  <p>Your current roll number "{rollNumber}" doesn't match the required format.</p>
                  <p className="mt-2">Valid formats:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>CS department: 22RUCSA020 (with section)</li>
                    <li>AI department: 23RUAI039 (without section)</li>
                  </ul>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">
                      Update your roll number to match the required format
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Your Roll Number"
                        value={studentRollNumber}
                        onChange={(e) => setStudentRollNumber(e.target.value.toUpperCase())}
                        className="bg-gray-800 border-gray-700"
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? 'Verifying...' : 'Update'}
                      </Button>
                    </div>

                    {validationError && (
                      <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {validationError}
                      </div>
                    )}

                    {successMessage && (
                      <div className="mt-2 text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {successMessage}
                      </div>
                    )}
                    
                    <div className="mt-2 text-gray-500 text-xs">
                      Format: Batch(22-24) + RU + Department(CS/AI) + Section(for CS) + Number(001-065)
                    </div>
                  </div>
                </form>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      fetcher.submit(
                        {
                          roll_number: '',
                          member_id: memberId?.toString() || '',
                        },
                        { method: 'post', action: '/api/update-roll-number' }
                      );
                      setIsDialogOpen(false);
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  Enter your college roll number (e.g., 22RUCSA020 or 23RUAI039)
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your Roll Number"
                    value={studentRollNumber}
                    onChange={(e) => setStudentRollNumber(e.target.value.toUpperCase())}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>

                {validationError && (
                  <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {validationError}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-2 text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                  </div>
                )}
                
                <div className="mt-2 text-gray-500 text-xs">
                  Format: Batch(22-24) + RU + Department(CS/AI) + Section(for CS) + Number(001-065)
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 text-sm">
                <h4 className="font-medium mb-2">
                  Why verify your roll number?
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Confirm your academic identity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Access college-specific resources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Participate in college events and competitions</span>
                  </li>
                </ul>
              </div>
            </form>
            )
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">{rollNumber}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-400 border-green-500/30"
                  >
                    Verified
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                Your college roll number meets the format requirements and has been verified.
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    fetcher.submit(
                      {
                        roll_number: '',
                        member_id: memberId?.toString() || '',
                      },
                      { method: 'post', action: '/api/update-roll-number' }
                    );
                    setIsDialogOpen(false);
                  }}
                >
                  Remove
                </Button>

                {hasDummyRollNumber && (
                  <Button
                    variant="outline"
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => {
                      // Switch to edit mode
                      setIsDialogOpen(false);
                      setTimeout(() => {
                        setStudentRollNumber(''); // Reset the field or pre-fill with existing value
                        setIsDialogOpen(true);
                      }, 100);
                    }}
                  >
                    Update Format
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="border-gray-700"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
