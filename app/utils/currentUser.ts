import { createServerSupabase } from "./supabase.server";

interface User {
    id: string;
    title: string;
}

async function getCurrentUser(request: Request): Promise<User | null> {
    const response = new Response();
    
    const supabase = createServerSupabase(request, response);
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        console.error("Error fetching user:", error);
        return null;
    }
    
    const { data, error: roleError } = await supabase
        .from("members")
        .select("title")
        .eq("github_username", user?.user_metadata.user_name)
        .single();
        
    
    if (roleError || !data) {
        console.error("Error fetching user role:", roleError);
        return null;
    }

    return { id: user.id, title: data.title };
}

async function isOrganiser(request: Request): Promise<boolean> {
    const user = await getCurrentUser(request);
    return user?.title === "Organiser";
}

async function isMentor(request: Request): Promise<boolean> {
    const user = await getCurrentUser(request);
    return user?.title === "Mentor";
}

export { getCurrentUser, isOrganiser, isMentor };
