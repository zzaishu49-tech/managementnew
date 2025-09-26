/*
  # Add project_id to brochure_projects table

  1. Schema Changes
    - Add `project_id` column to `brochure_projects` table
    - Create foreign key constraint linking to `projects` table
    - Add index for performance optimization

  2. Data Migration
    - Attempt to link existing brochure projects to projects based on client_id
    - Set project_id to NULL for brochure projects without matching projects

  3. Security
    - No RLS policy changes needed as existing policies will continue to work
    - The new column will inherit the same access controls

  This migration enables proper project-scoped brochure visibility while maintaining
  backward compatibility with existing data.
*/

-- Add project_id column to brochure_projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brochure_projects' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.brochure_projects 
    ADD COLUMN project_id UUID;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'brochure_projects_project_id_fkey'
  ) THEN
    ALTER TABLE public.brochure_projects
    ADD CONSTRAINT brochure_projects_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_brochure_projects_project_id'
  ) THEN
    CREATE INDEX idx_brochure_projects_project_id 
    ON public.brochure_projects(project_id);
  END IF;
END $$;

-- Migrate existing data: link brochure projects to projects based on client_id
-- This will set project_id for existing brochure projects where a matching project exists
UPDATE public.brochure_projects 
SET project_id = (
  SELECT p.id 
  FROM public.projects p 
  WHERE p.client_id = brochure_projects.client_id 
  LIMIT 1
)
WHERE project_id IS NULL;