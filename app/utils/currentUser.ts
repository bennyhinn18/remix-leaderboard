
// Adjust the import based on your actual database setup
import { createServerSupabase } from "./supabase.server";

interface User {
    id: number;
    title: string;
}



async function getCurrentUser(request: Request): Promise<User | null> {
    const response = new Response();
    
    const supabase = createServerSupabase(request, response); // Assuming it initializes Supabase correctly
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        return null;
    }
    
    const { data, error: roleError } = await supabase
        .from("members")
        .select("title")
        .eq("user_id", user.id)
        .single();
    

    if (roleError || !data) {
        return null;
    }

    return { id: user.id, title: data.title };
}

async function isOrganiser(request: Request): Promise<boolean> {
    const user = await getCurrentUser(request);
    return user?.title === "Organiser";
}

export { getCurrentUser, isOrganiser };
