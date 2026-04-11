# Class System API Test Guide

This document provides manual test cases to verify the database schema, API endpoints, and RLS policies for the flex class system.

## Prerequisites

1. Start the development server: `pnpm dev`
2. Ensure you have a logged-in user session
3. Have at least one website created

## Test Cases

### 1. Variables API Tests

#### Test 1.1: Create a Variable
```bash
# POST /api/websites/{websiteId}/variables
curl -X POST http://localhost:4321/api/websites/{websiteId}/variables \
  -H "Content-Type: application/json" \
  -H "Cookie: {your-session-cookie}" \
  -d '{
    "name": "Primary Color",
    "key": "color.primary",
    "category": "color",
    "type": "color",
    "value_light": "#f3602a",
    "value_dark": "#ff7a4d"
  }'

# Expected: 201 Created with variable object
```

#### Test 1.2: List All Variables
```bash
# GET /api/websites/{websiteId}/variables
curl http://localhost:4321/api/websites/{websiteId}/variables \
  -H "Cookie: {your-session-cookie}"

# Expected: 200 OK with array of variables
```

#### Test 1.3: Get Single Variable
```bash
# GET /api/websites/{websiteId}/variables/{variableId}
curl http://localhost:4321/api/websites/{websiteId}/variables/{variableId} \
  -H "Cookie: {your-session-cookie}"

# Expected: 200 OK with variable object
```

#### Test 1.4: Update a Variable
```bash
# PATCH /api/websites/{websiteId}/variables/{variableId}
curl -X PATCH http://localhost:4321/api/websites/{websiteId}/variables/{variableId} \
  -H "Content-Type: application/json" \
  -H "Cookie: {your-session-cookie}" \
  -d '{
    "value_light": "#e55020",
    "value_dark": "#ff8a5d"
  }'

# Expected: 200 OK with updated variable object
```

#### Test 1.5: Delete a Variable
```bash
# DELETE /api/websites/{websiteId}/variables/{variableId}
curl -X DELETE http://localhost:4321/api/websites/{websiteId}/variables/{variableId} \
  -H "Cookie: {your-session-cookie}"

# Expected: 204 No Content
```

### 2. Style Classes API Tests

#### Test 2.1: Create a Style Class
```bash
# POST /api/websites/{websiteId}/style-classes
curl -X POST http://localhost:4321/api/websites/{websiteId}/style-classes \
  -H "Content-Type: application/json" \
  -H "Cookie: {your-session-cookie}" \
  -d '{
    "name": "Centered Column",
    "description": "A centered flex column layout",
    "type": "custom",
    "properties": {
      "flexDirection": { "desktop": "column" },
      "alignItems": { "desktop": "center" },
      "justifyContent": { "desktop": "center" }
    }
  }'

# Expected: 201 Created with style class object
```

#### Test 2.2: List All Style Classes
```bash
# GET /api/websites/{websiteId}/style-classes
curl http://localhost:4321/api/websites/{websiteId}/style-classes \
  -H "Cookie: {your-session-cookie}"

# Expected: 200 OK with array of style classes
```

#### Test 2.3: Get Single Style Class
```bash
# GET /api/websites/{websiteId}/style-classes/{classId}
curl http://localhost:4321/api/websites/{websiteId}/style-classes/{classId} \
  -H "Cookie: {your-session-cookie}"

# Expected: 200 OK with style class object
```

#### Test 2.4: Update a Style Class
```bash
# PATCH /api/websites/{websiteId}/style-classes/{classId}
curl -X PATCH http://localhost:4321/api/websites/{websiteId}/style-classes/{classId} \
  -H "Content-Type: application/json" \
  -H "Cookie: {your-session-cookie}" \
  -d '{
    "description": "Updated description",
    "properties": {
      "flexDirection": { "desktop": "column" },
      "alignItems": { "desktop": "center" },
      "justifyContent": { "desktop": "flex-start" },
      "gap": { "desktop": "16px" }
    }
  }'

# Expected: 200 OK with updated style class object
```

#### Test 2.5: Delete a Style Class
```bash
# DELETE /api/websites/{websiteId}/style-classes/{classId}
curl -X DELETE http://localhost:4321/api/websites/{websiteId}/style-classes/{classId} \
  -H "Cookie: {your-session-cookie}"

# Expected: 204 No Content
```

### 3. RLS Policy Tests

#### Test 3.1: Verify Website Scoping
1. Create a variable for Website A
2. Try to access it using Website B's ID
3. Expected: Should not be visible (empty array or 404)

#### Test 3.2: Verify Editor Access
1. Add a collaborator with 'editor' role to a website
2. Login as the collaborator
3. Try to create/update/delete variables and style classes
4. Expected: All operations should succeed

#### Test 3.3: Verify Viewer Access
1. Add a collaborator with 'viewer' role to a website
2. Login as the collaborator
3. Try to create/update/delete variables and style classes
4. Expected: Read operations succeed, write operations fail

#### Test 3.4: Verify System Class Protection
1. Create a system class (is_system = true)
2. Try to rename it via PATCH
3. Expected: 403 Forbidden with error message
4. Try to delete it via DELETE
5. Expected: 403 Forbidden with error message

### 4. Validation Tests

#### Test 4.1: Invalid Category
```bash
curl -X POST http://localhost:4321/api/websites/{websiteId}/variables \
  -H "Content-Type: application/json" \
  -H "Cookie: {your-session-cookie}" \
  -d '{
    "name": "Test",
    "key": "test.key",
    "category": "invalid",
    "type": "color",
    "value_light": "#000",
    "value_dark": "#fff"
  }'

# Expected: 400 Bad Request with "Invalid category" error
```

#### Test 4.2: Invalid Type
```bash
curl -X POST http://localhost:4321/api/websites/{websiteId}/variables \
  -H "Content-Type: application/json" \
  -H "Cookie: {your-session-cookie}" \
  -d '{
    "name": "Test",
    "key": "test.key",
    "category": "color",
    "type": "invalid",
    "value_light": "#000",
    "value_dark": "#fff"
  }'

# Expected: 400 Bad Request with "Invalid type" error
```

#### Test 4.3: Duplicate Key
```bash
# Create a variable with key "color.primary"
# Try to create another variable with the same key
# Expected: Database constraint error (unique violation)
```

#### Test 4.4: Missing Required Fields
```bash
curl -X POST http://localhost:4321/api/websites/{websiteId}/variables \
  -H "Content-Type: application/json" \
  -H "Cookie: {your-session-cookie}" \
  -d '{
    "name": "Test"
  }'

# Expected: 400 Bad Request with "All fields are required" error
```

### 5. Performance Tests

#### Test 5.1: Index Usage
1. Create 100+ variables across different categories
2. Query variables filtered by category
3. Check query execution time (should use idx_variables_website_category)

#### Test 5.2: Bulk Operations
1. Create 50+ style classes
2. List all style classes
3. Verify response time is acceptable (< 500ms)

## Database Verification

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('variables', 'style_classes');
```

### Check Indexes
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('variables', 'style_classes');
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('variables', 'style_classes');
```

### Check Constraints
```sql
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid IN ('public.variables'::regclass, 'public.style_classes'::regclass);
```

## Success Criteria

- ✅ All tables created with correct schema
- ✅ All indexes created for performance
- ✅ RLS policies enforce website-scoped access
- ✅ API endpoints handle CRUD operations correctly
- ✅ Validation prevents invalid data
- ✅ System classes protected from deletion/rename
- ✅ Editor role can modify, viewer role can only read
- ✅ Unauthorized access returns 401
- ✅ Cross-website access blocked by RLS
