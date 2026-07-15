import { supabase } from './supabase';

const BUCKET = 'member-avatars';
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function extFromMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}

/** Upload a member profile image to Supabase Storage; returns public URL. */
export async function uploadMemberAvatar(memberId: string, file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) {
    throw new Error('Use a JPG, PNG, WEBP, or GIF image.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be 2 MB or smaller.');
  }

  const path = `${memberId}/avatar.${extFromMime(file.type)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600',
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Bust CDN/browser cache after replace
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function removeMemberAvatar(memberId: string): Promise<void> {
  const { data: files } = await supabase.storage.from(BUCKET).list(memberId);
  if (!files?.length) return;
  const paths = files.map((f) => `${memberId}/${f.name}`);
  await supabase.storage.from(BUCKET).remove(paths);
}
