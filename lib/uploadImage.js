import { supabase, IMAGES_BUCKET } from "./supabaseClient";

// Uploads a File object to the "images" Supabase Storage bucket and
// returns a public URL that can be saved straight into a table row.
export async function uploadImage(file, folder = "misc") {
  if (!file) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("Image upload failed:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
