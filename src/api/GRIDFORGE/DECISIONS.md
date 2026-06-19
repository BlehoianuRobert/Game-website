Architecture Decisions & Refactoring Log — Backend
1. High-Level Architecture Choices
   The 3-Pillar Domain Strategy: We organized our business logic into three clean pillars: User/Player Management, Core Game Loops, and Transactions/Inventories.

Why we chose this: Splitting the monolithic default Laravel setup into isolated namespaces protects our domain boundaries. In a fast-paced hackathon environment, this structural clarity prevents team members from writing overlapping or tangled code, speeding up feature delivery.

2. The Great Refactor: Before vs. After
   Before Refactoring
   The Problem: Universal structural ambiguity. Controllers (GameController.php, AuthController.php) and models (User.php, Player.php) lived directly under root folders.

The Complication: Git merge conflicts were common because teammates were editing shared folders. Files were easily misplaced or left behind during rapid branch integrations.

After Refactoring
The Solution: Relative pathing, absolute isolation. Files were grouped logically by domain rather than framework type.

Example Pathing: Models now reside in targeted directories, such as App\Models\User\Player, keeping them separate from unrelated systems.

The Merge Strategy: Successfully resolved Git pathspec and conflict errors caused by terminal paths (src/api/GRIDFORGE/...) overlapping with working directory roots during the transition. Old files were systematically moved or deleted without affecting functional components.

3. Middleware & Core Syntax Fixes
   The Bug: A broken closure syntax within bootstrap/app.php triggered compilation blocks (PHP Parse error: syntax error, unexpected variable "$middleware"). This happened when core configuration lines were accidentally pasted outside their respective scoping closures.

The Fix: Unified all custom alias configurations, ensuring that both the critical role guard (CheckRole::class) and the auth mapping middleware (AuthenticateFromCookie::class) were securely nested inside a single, functional context block.

4. Seeder Bug Fixes & Schema Realignment
   During the database population phase, we faced two major dependency loops that required structural adjustments:

Issue A: PSR-4 Factory Autoload Failures
The Error: Class "Database\Factories\User\PlayerFactory" not found during the database seeding step.

The Cause: Laravel's auto-discovery engine expects a factory's namespace and folder tree to mirror its model. Our file was initially named UserFactory.php in the base directory instead of matching our new 3-pillar structure.

The Resolution: Used native path commands to move the asset to database/factories/User/PlayerFactory.php, updated the file to declare the correct namespace (Database\Factories\User;), and regenerated the composer autoloader mapping array.

Issue B: Schema Mismatches
The Error: SQLSTATE[42703]: Undefined column: 7 ERROR: column "email_verified_at" of relation "players" does not exist.

The Cause: The default factory template tried to write to fallback Laravel columns (email_verified_at, remember_token) that were completely absent from our custom PostgreSQL hackathon table schema.

The Resolution: Cleaned up the factory definition to target existing columns (username, email, status, password), creating a database state that populates seamlessly via php artisan migrate:fresh --seed.

5. API Documentation Enforcement
   The Choice: To ensure frontend developers could use the interactive "Try it out" feature inside Swagger UI, we manually updated storage/api-docs/api-docs.yaml with explicit model objects and sample parameters instead of empty payload configurations.

Tracking Adjustment: Because storage/ is globally ignored by .gitignore in standard configurations, we used a forced staging strategy (git add -f) to ensure our interactive API blueprint is pushed and tracked across team branches.
