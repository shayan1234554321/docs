---
name: audit
description: Run security, accessibility, and performance audits on code. Generates a scored report with P0-P3 severity ratings and actionable recommendations. Use when the user wants a code quality audit, security vulnerability check, or technical debt assessment.
user-invocable: true
argument-hint: "[target (file, folder, feature, API...)]"
---

Run systematic security, accessibility, and performance audits on code to identify vulnerabilities, code quality issues, and technical risks. Generate a comprehensive report with severity ratings.

## MANDATORY PREPARATION

**STEP 0 — Understand the Scope**
Before auditing:
- Read CLAUDE.md to understand project architecture and conventions
- Identify the tech stack (language, framework, dependencies)
- Understand what the target code does (read documentation, run it if possible)
- Identify trust boundaries (user input, external APIs, database, file system)

---

## STEP 1 — Security Audit

Security audit focuses on identifying vulnerabilities that could be exploited by attackers.

### Input Validation & Sanitization
**Check for**:
- **Injection vulnerabilities**: SQL injection, NoSQL injection, command injection, XSS, LDAP injection
- **Path traversal**: Unsanitized file paths that could access unintended files
- **XXE**: XML external entity attacks in XML parsers
- **Deserialization**: Unsafe deserialization of untrusted data

**Danger signs**:
- String concatenation in queries: `"SELECT * FROM users WHERE id=" + userId`
- InnerHTML/dangerouslySetInnerHTML without sanitization
- `eval()` or `new Function()` with user input
- File paths built from user input without validation
- XML parsers without disabled external entities

### Authentication & Authorization
**Check for**:
- **Broken authentication**: Weak passwords, missing MFA, improper session handling
- **Broken access control**: Missing authorization checks, IDOR vulnerabilities
- **Privilege escalation**: Users can access admin features
- **Horizontal/vertical privilege leakage**: Users accessing other users' data

**Danger signs**:
- Authentication that relies solely on client-side checks
- Missing role/permission checks on sensitive endpoints
- Direct object references without ownership verification
- Predictable session IDs or tokens
- Secrets stored in client-side code

### Data Protection
**Check for**:
- **Sensitive data exposure**: Logging sensitive data, error messages revealing internals
- **Insecure storage**: Sensitive data in localStorage, cookies without httpOnly, cleartext in logs
- **Data leakage**: Over-exposure in API responses, missing field-level access control

**Danger signs**:
- `console.log(user)` or similar logging of sensitive objects
- API responses returning full objects when only subset is needed
- Secrets in environment variables not properly guarded
- Sensitive data in URL parameters or referrer headers
- Missing data masking for PII in logs/monitoring

### Cryptography
**Check for**:
- **Weak algorithms**: MD5, SHA1 for security purposes, DES, ROT13
- **Custom crypto**: Rolling your own crypto instead of using established libraries
- **Key management**: Hardcoded keys, keys in source code

**Danger signs**:
- Using `crypto.md5()` or similar weak hash functions
- Storing passwords without proper hashing (bcrypt, argon2)
- Keys or secrets in source code or version control
- Improper random number generation for security purposes

### API Security
**Check for**:
- **Missing rate limiting**: Endpoints vulnerable to brute force or DoS
- **Missing CORS**: Improperly configured or overly permissive
- **CSRF**: Missing CSRF tokens on state-changing operations
- **GraphQL issues**: Introspection enabled in production, depth limiting missing

**Danger signs**:
- No rate limiting on authentication endpoints
- `Access-Control-Allow-Origin: *` without credentials
- Missing authorization header validation
- No query depth/amount limiting on GraphQL

### Dependency Vulnerabilities
**Check for**:
- **Outdated dependencies**: Known CVEs in current versions
- **Malicious packages**: Typosquatting, supply chain attacks
- **Deprecated packages**: Packages no longer maintained

**Danger signs**:
- `npm audit` or `pnpm audit` showing vulnerabilities
- Packages with no recent updates but heavy security reliance
- Packages with suspiciously similar names to popular packages

### Security Score (0-4)
| Score | Security Level |
|-------|----------------|
| 0 | Critical vulnerabilities exposed (injection, broken auth) |
| 1 | Major vulnerabilities exist (missing validation, weak crypto) |
| 2 | Moderate issues (some hardening missing, verbose errors) |
| 3 | Minor gaps (missing security headers, limited logging) |
| 4 | Excellent (proper hardening, defense in depth) |

---

## STEP 2 — Performance Audit

Performance audit focuses on identifying slow code, inefficient algorithms, and resource waste.

### Algorithm Efficiency
**Check for**:
- **O(n²) or worse**: Nested loops processing large datasets
- **N+1 queries**: Making multiple database calls in loops
- **Unnecessary work**: Recalculating the same thing repeatedly
- **Missing caching**: Repeated expensive computations without memoization

**Danger signs**:
- `for` loops inside `for` loops over arrays
- Database queries inside `.map()` or `.forEach()`
- Recursive functions without memoization
- Loading large datasets when you only need one item

### Database Performance
**Check for**:
- **Missing indexes**: Queries on unindexed columns
- **Full table scans**: `SELECT *` when you need specific columns
- **Large object retrieval**: Fetching blobs, JSON fields unnecessarily
- **Connection leaks**: Not properly closing database connections

**Danger signs**:
- Queries without `WHERE` clauses fetching entire tables
- No pagination on large result sets
- Storing large JSON in database columns
- Missing query result caching

### Memory Management
**Check for**:
- **Memory leaks**: Unclosed connections, unbounded caches, event listeners not removed
- **Large allocations**: Loading large files into memory at once
- **Bounded resources**: Streams not used for large data

**Danger signs**:
- `useEffect` without cleanup returning cleanup function
- Event listeners added but never removed
- Caches that grow without limits
- `fs.readFileSync()` on large files

### Network Efficiency
**Check for**:
- **Blocking requests**: Synchronous HTTP calls
- **Missing pagination**: Fetching all data when paginated
- **Redundant requests**: Same data fetched multiple times
- **Missing debouncing**: Rapid API calls on user input

**Danger signs**:
- `await fetch()` in loops
- No request deduplication
- Missing `AbortController` for cancelled requests
- No request caching

### Bundle & Loading
**Check for**:
- **Large bundle size**: Importing entire libraries for one function
- **Unused code**: Dead code, commented-out code still shipped
- **Duplication**: Multiple versions of same library
- **Render blocking**: Synchronous scripts in head

**Danger signs**:
- `import _ from 'lodash'` when you only need `debounce`
- No code splitting on large pages
- 3MB+ JavaScript bundles for simple pages
- Duplicate dependencies in package-lock.json

### Performance Score (0-4)
| Score | Performance Level |
|-------|------------------|
| 0 | Critical (blocking operations, memory leaks) |
| 1 | Major problems (N+1 queries, O(n²) algorithms) |
| 2 | Moderate (missing caching, no pagination) |
| 3 | Minor gaps (bundle optimizations possible) |
| 4 | Excellent (optimal algorithms, well-optimized) |

---

## STEP 3 — Accessibility Audit (Code-Level)

Accessibility audit checks for technical a11y issues that can be verified in code.

### Semantic HTML
**Check for**:
- **Headings**: Proper h1-h6 hierarchy (only one h1, logical order)
- **Landmarks**: `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`
- **Buttons vs links**: Interactive elements use correct elements
- **Lists**: `<ul>`, `<ol>` for lists of items

**Danger signs**:
- Multiple `<h1>` elements on same page
- Skipped heading levels (h1 → h3)
- `<div>` or `<span>` for clickable elements
- `<a>` tags used for JavaScript actions

### ARIA
**Check for**:
- **Correct roles**: `role="button"` when not a `<button>`
- **Labels**: `aria-label`, `aria-labelledby`, `aria-describedby`
- **States**: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`
- **Live regions**: `aria-live` for dynamic content

**Danger signs**:
- `role` attribute without proper associated attributes
- Buttons without accessible names
- Dynamic content without `aria-live` announcements
- `aria-hidden="true"` on focusable elements

### Keyboard Navigation
**Check for**:
- **Focus management**: Visible focus indicators, logical tab order
- **Keyboard traps**: Modal/content that can't be exited
- **Skip links**: Ability to skip repetitive navigation
- **Shortcuts**: Keyboard shortcuts defined and discoverable

**Danger signs**:
- `tabindex > 0` creating artificial tab order
- `onclick` without corresponding keyboard support
- Modals without focus trap
- No way to dismiss modals except clicking X

### Forms
**Check for**:
- **Labels**: Every input has associated `<label>`
- **Error handling**: Errors announced, linked to inputs
- **Required indicators**: `required` or `aria-required`
- **Autocomplete**: `autocomplete` attribute for known fields

**Danger signs**:
- Inputs without labels or `aria-label`
- Errors that are only color-coded
- `placeholder` used as sole label
- No error message or incorrect `aria-describedby`

### Accessibility Score (0-4)
| Score | Accessibility Level |
|-------|---------------------|
| 0 | Inaccessible (no ARIA, no keyboard nav) |
| 1 | Major gaps (some labels, broken keyboard nav) |
| 2 | Partial (effort made, significant gaps) |
| 3 | Good (WCAG AA mostly met) |
| 4 | Excellent (approaches AAA) |

---

## STEP 4 — Technical Debt Assessment

Identify code quality issues that slow down future development.

### Code Complexity
**Check for**:
- **High cyclomatic complexity**: Many branches, deeply nested conditionals
- **Long functions**: Functions doing too many things
- **Large files**: Files with too many exports or lines
- **Deep inheritance**: Deep class hierarchies

**Danger signs**:
- Functions with 10+ if statements
- Files with 500+ lines
- Classes inheriting from classes inheriting from classes
- Functions with 10+ parameters

### Maintainability
**Check for**:
- **Magic numbers**: Hardcoded numbers without constants
- **Duplication**: Repeated code patterns that should be extracted
- **Dead code**: Unused functions, imports, variables
- **Commented code**: Code commented out rather than deleted

**Danger signs**:
- `setTimeout(fn, 86400000)` instead of `ONE_DAY_MS`
- Same validation logic copied in 5 places
- Functions defined but never called
- Large blocks of commented code

### Type Safety
**Check for**:
- **TypeScript**: Missing types, `any` overuse
- **Runtime validation**: Missing input validation
- **Error handling**: Swallowed errors, missing try/catch

**Danger signs**:
- `any` type used for complex objects
- No runtime validation of external data
- Empty catch blocks or `catch (e) {}`
- Functions that can throw without documentation

### Technical Debt Score (0-4)
| Score | Debt Level |
|-------|------------|
| 0 | Critical (unmaintainable, massive debt) |
| 1 | Major (significant issues slowing work) |
| 2 | Moderate (some debt, manageable) |
| 3 | Minor (small issues, normal) |
| 4 | Excellent (well-maintained, low debt) |

---

## STEP 5 — Generate Report

### Audit Health Score

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| Security | ?/4 | [most critical security issue or "--"] |
| Performance | ?/4 | |
| Accessibility | ?/4 | |
| Technical Debt | ?/4 | |
| **Total** | **??/16** | **[Rating band]** |

**Rating bands**: 14-16 Excellent, 10-13 Good, 6-9 Acceptable, 3-5 Poor, 0-2 Critical

### Executive Summary
- Audit Health Score: **??/16** ([rating band])
- Security issues (count by severity: P0/P1/P2/P3)
- Performance issues
- Accessibility issues
- Technical debt observations
- Top 3-5 critical issues requiring immediate attention
- Recommended next steps

### Detailed Findings by Severity

Tag every issue with **P0-P3 severity**:
- **P0 Blocking**: Exploitable vulnerability or critical performance issue — fix immediately
- **P1 Major**: Significant security/accessibility/performance gap — fix before release
- **P2 Minor**: Technical debt or maintainability issue — fix in next sprint
- **P3 Polish**: Minor improvement — fix if time permits

For each issue, document:
- **[P?] Issue name**
- **Location**: File, function, line number
- **Category**: Security / Performance / Accessibility / Technical Debt
- **Impact**: How it affects users or maintainability
- **Evidence**: Specific code pattern or finding
- **Recommendation**: How to fix it

### Patterns & Systemic Issues

Identify recurring problems that indicate systemic gaps rather than one-off mistakes:
- "Input validation missing in 8 API endpoints"
- "Same security issue in 3 authentication flows"
- "Memory leak pattern repeated in 4 components"
- "Hard-coded credentials appear across 5+ configuration files"

### Positive Findings

Note what's working well — good practices to maintain and replicate.

### Recommended Actions

List recommended commands in priority order (P0 first, then P1, then P2):

1. **[P?] `/command-name`** — Brief description (specific context from audit findings)
2. **[P?] `/command-name`** — Brief description (specific context)

**Rules**: Only recommend commands from: /animate, /arrange, /critique, /extract, /polish, /optimize, /audit, /typeset, /bolder, /clarify, /delight, /adapt, /colorize, /quieter, /harden, /distill, /onboard, /normalize, /overdrive. Map findings to the most appropriate command. End with `/polish` as the final step if any fixes were recommended.

After presenting the summary, tell the user:

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/audit` after fixes to see your score improve.

**IMPORTANT**: Be thorough but actionable. Too many P3 issues creates noise. Focus on what actually matters.

---

## NEVER
- Report issues without specific file locations and line numbers
- Claim something is a vulnerability without clear evidence
- Suggest fixes without understanding the codebase context
- Ignore false positives (verify before reporting)
- Prioritize everything as P0 (be ruthlessly specific)
- Skip the security audit (it's often overlooked but critical)
- Forget to check dependencies (supply chain vulnerabilities)

Remember: You're a thorough technical auditor. Your job is to find issues systematically, document them clearly, and provide actionable paths to improvement. Be specific in your findings, honest in your assessments, and helpful in your recommendations.
