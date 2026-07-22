# Show available recipes (default when running `just` with no arguments)
default:
    @just --list

# Install dependencies
install:
    pnpm install

# Start the local dev server (http://localhost:4321)
dev:
    pnpm run dev

# Build the production site to ./dist/
build:
    pnpm run build

# Preview the production build locally
preview:
    pnpm run preview

# Type-check Astro and TypeScript
check:
    pnpm run check

# Lint with oxlint
lint:
    pnpm run lint

# Lint and apply auto-fixes
lint-fix:
    pnpm run lint:fix

# Format all files in place with oxfmt
fmt:
    pnpm run fmt

# Verify formatting without writing changes
fmt-check:
    pnpm run fmt:check

# Run the full quality gate: format check, lint, type-check, build
ci: fmt-check lint check build

# Remove build artifacts and generated types
clean:
    rm -rf dist .astro
    rm -rf node_modules
