# CV Build Plan — Enrique Martín Ocaña
# Template: https://github.com/sb2nov/resume

## Goal
Clone the sb2nov/resume LaTeX template, rename it, and replace all content
with Enrique's CV data. Produce a clean, ATS-friendly, one-page PDF.

---

## Step 1 — Clone and scaffold

```bash
git clone https://github.com/sb2nov/resume.git enrique-cv
cd enrique-cv
cp sourabh_bajaj_resume.tex enrique_martin_resume.tex
rm sourabh_bajaj_resume.tex sourabh_bajaj_resume.pdf resume_preview.png
```

---

## Step 2 — Replace the entire content of `enrique_martin_resume.tex`

Keep the preamble (document class, packages, custom commands) exactly as-is
from the original file. Only replace everything between \begin{document} and
\end{document} with the content below.

The sb2nov template uses these custom commands — use them consistently:
- `\resumeSubheading{Title}{Date}{Subtitle}{Location}` for job/edu headings
- `\resumeItem{text}` for bullet points
- `\resumeSubItem{label}{description}` for skills/projects
- `\resumeSubHeadingListStart` / `\resumeSubHeadingListEnd` to wrap sections
- `\resumeItemListStart` / `\resumeItemListEnd` to wrap bullet lists

---

## Step 3 — Content to populate

### Header
```
Enrique Martín Ocaña
Bicester, Oxfordshire
+44 7444 241378 | quiquemartinocana@gmail.com
quiquemartin.dev | linkedin.com/in/enriquemaoc
```

### Summary (place as a short italic line or small section under header)
```
Software engineer with 4+ years of experience (including internship) building
full-stack systems in C#/.NET and React, across high-performance engineering
(Aston Martin F1) and media (Disney). Specialises in distributed systems,
observability, and agentic AI workflows. ScotlandIS Young Software Engineer
of the Year 2023. UK Settled Status.
```

### Experience

**Aston Martin Aramco F1 Team — Silverstone, UK**
Software Engineer | Sep 2025 – Present
Graduate Software Engineer | Sep 2023 – Sep 2025

Bullets (write each as a \resumeItem, keep to one line where possible):
- Built compute-intensive simulation systems in C# and .NET 8 processing
  race car telemetry across distributed infrastructure under race-weekend
  deadlines, handling ~2M telemetry events per session.
- Designed internal APIs, CLI tools and orchestration layers managing
  complex simulation models and post-processing workflows at scale.
- Led delivery of a rule-driven validation engine translating F1 regulatory
  constraints into deterministic evaluation code adopted across the full
  simulation platform.
- Introduced OpenTelemetry tracing and metrics into the Grafana/Loki stack,
  reducing mean time-to-diagnose incidents from ~40 minutes to under 5 —
  critical during race-weekend on-call windows.
- Authored and rolled out team-wide agentic AI coding standards — covering
  Claude/Cursor configuration, context-engineering patterns and AI code-review
  rubrics — adopted by the full engineering team on a security-sensitive,
  real-time codebase.
- Worked directly with performance analysts to interpret telemetry, refine
  requirements and ship reliably under operational pressure.
Stack: C\#, .NET 8, React, GraphQL, SQL Server, MongoDB, InfluxDB, Kafka,
RabbitMQ, Docker, Kubernetes, Azure DevOps, OpenTelemetry

---

**Santander Global Tech — Málaga, Spain**
Software Engineer Analyst | Apr 2023 – Sep 2023

Bullets:
- Built Python data pipelines aggregating and normalising financial data from
  disparate systems, replacing manual Excel reconciliation for ~10 analysts.
- Delivered internal dashboards (Dash/Plotly) giving finance and operations
  teams self-serve access to metrics previously requiring analyst requests.
- Iterated on metric definitions with finance stakeholders, treating pipeline
  maintainability as a first-class requirement.
Stack: Python, Pandas, Dash, Plotly, GitHub Actions

---

**The Walt Disney Company — London, UK**
Technical Engineer Intern | Jun 2021 – Jun 2022

Bullets:
- Built internal tools in ASP.NET and React streamlining asset management
  and content delivery workflows across multiple Disney departments.
- Refactored legacy C\# backend services into a modular, clean-architecture
  pattern, measurably improving testability and extensibility.
- Shipped accessibility improvements to React front-ends (ARIA standards)
  and supported rollout of CI/CD pipelines across internal applications.
- Worked cross-functionally with content operations, legal and engineering
  to gather requirements and release tooling iteratively.
Stack: C\# (.NET), React, AWS, Azure DevOps, SQL

---

### Education

**University of Strathclyde — Glasgow, Scotland**
BSc (Hons) Software Engineering — Pass with Distinction | Sep 2018 – Apr 2023

Note: five-year integrated degree with industrial placement year (Disney).
Final project: AI-powered autoregressive language tool supporting primary
education learning.

---

### Skills (use \resumeSubItem for each category)

Languages \& Frameworks: C\#, .NET 8/10, TypeScript, JavaScript, React,
Python, SQL, GraphQL

Cloud \& Infrastructure: Azure (primary), AWS, Docker, Kubernetes (AKS),
Terraform, GitHub Actions, Azure DevOps

Data: SQL Server, PostgreSQL, MongoDB, InfluxDB, vector DBs (pgvector)

Messaging: Kafka, RabbitMQ, Azure Service Bus

Practices: TDD, Clean Architecture, SOLID, DDD, CI/CD, OpenTelemetry,
Grafana, Loki, Agile/Scrum

AI \& Tooling: Microsoft.Extensions.AI, Semantic Kernel, MCP (C\# SDK),
RAG patterns, Claude Code, GitHub Copilot, context engineering

---

### Honours \& Awards

- Winner — ScotlandIS Young Software Engineer of the Year (2023)
- Winner — Charles Babbage Award, University of Strathclyde (2023)
  — best dissertation project across the graduating cohort

---

### Languages \& Right to Work (optional small section or footer line)

Spanish (native) · English C1 Advanced (Cambridge)
UK Settled Status · EU citizen (Spain)

---

## Step 4 — Formatting rules to enforce

1. Keep to ONE PAGE. If content overflows, tighten \vspace values or
   trim bullet word count — do not add a second page.
2. Each bullet must start with a strong past-tense verb (Built, Designed,
   Led, Introduced, Authored, Delivered, Refactored, Shipped).
3. Every bullet at F1 and Disney must contain at least one number or
   scale indicator (e.g. ~2M events, ~10 analysts, N engineers, etc.)
4. Escape special characters in LaTeX: & → \&, # → \#, % → \%,
   ~ → \textasciitilde, < > → use math mode or \textless \textgreater
5. The stack line at the end of each role should be in \textit{} and
   smaller font if the template supports it, otherwise plain text is fine.
6. Do NOT use colour, columns, photos, icons or tables — keep it
   plain LaTeX compatible with ATS scanners.

---

## Step 5 — Build and verify

Build using Docker (no local LaTeX install needed):
```bash
docker build -t latex .
docker run --rm -i -v "$PWD":/data latex pdflatex enrique_martin_resume.tex
```

Or if using Overleaf: upload enrique_martin_resume.tex, compile, download PDF.

After building:
- Confirm the output is exactly one page
- Confirm name and contact details appear correctly in the header
- Confirm all section headings are present: Summary, Experience, Education,
  Skills, Honours & Awards
- Confirm no LaTeX compilation errors in the log
- Confirm the PDF filename is `enrique_martin_resume.pdf`

---

## Step 6 — Cleanup

```bash
rm -f *.aux *.log *.out *.fls *.fdb_latexmk
```

Commit the final state:
```bash
git add enrique_martin_resume.tex enrique_martin_resume.pdf
git commit -m "feat: add Enrique Martin CV based on sb2nov template"
```

---

## Notes for Claude Code

- The preamble of the original .tex file defines all the custom commands
  (\resumeItem, \resumeSubheading, etc.) — do not remove or modify them.
- If the one-page constraint is tight, the Santander role can be reduced
  to 2 bullets and the Disney stack line can be omitted.
- The Skills section should be the last major section before Honours,
  as it is a keyword-dense section that benefits from being near the bottom
  for ATS scanning order.
- Do not add a References section.
- Do not add a photo.
- quiquemartin.dev and linkedin.com/in/enriquemaoc should be hyperlinked
  using \href{} if the template's preamble includes the hyperref package
  (the original sb2nov template does include it).
