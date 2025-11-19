-- 1. Add the new 'userId' column, linking it to the auth.users table
ALTER TABLE media_items
ADD COLUMN "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. (FIX) Delete existing data without a user.
-- This is necessary to apply the NOT NULL constraint below.
DELETE FROM media_items WHERE "userId" IS NULL;

-- 3. Make sure all future media items MUST have a user
ALTER TABLE media_items
ALTER COLUMN "userId" SET NOT NULL;

-- 4. Create an index for fast lookups
CREATE INDEX idx_media_items_userId ON media_items("userId");

-- 5. Remove the old, insecure policy
DROP POLICY "Allow public read and insert" ON media_items;

-- 6. POLICY: Allow users to VIEW their own media
CREATE POLICY "Allow auth user to read their own media"
ON media_items
FOR SELECT
USING (
  auth.role() = 'authenticated' AND "userId" = auth.uid()
);

-- 7. POLICY: Allow users to UPLOAD (insert) media for themselves
CREATE POLICY "Allow auth user to insert their own media"
ON media_items
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND "userId" = auth.uid()
);

-- 8. POLICY: Allow users to UPDATE their own media (e.g., rename)
CREATE POLICY "Allow auth user to update their own media"
ON media_items
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND "userId" = auth.uid()
)
WITH CHECK (
  "userId" = auth.uid()
);

-- 9. POLICY: Allow users to DELETE their own media
CREATE POLICY "Allow auth user to delete their own media"
ON media_items
FOR DELETE
USING (
  auth.role() = 'authenticated' AND "userId" = auth.uid()
);