# Week 10 — Reflection: From Demo to Production

The biggest surprise about production-grade testing was that the hardest part was not writing assertions. It was deciding what deserved protection. During the Week 9 demo, the system looked simple because the happy path worked: a user submitted a lead, the n8n workflow processed it, and the UI displayed the result. Testing exposed how many boundaries exist between those three visible steps.

The most important boundary is the n8n request. The application depends on an external workflow, so several things can go wrong without any change to the UI: the workflow can be inactive, return a non-2xx status, return malformed JSON, change its response wrapper, take too long, or fail at the network layer. Those failures are not edge cases from an engineering perspective; they are normal conditions that a production system must handle predictably.

Another lesson was that coverage can be misleading. A large percentage does not automatically mean a system is well tested. I focused instead on critical behavior: request construction, response parsing, error mapping, timeout handling, and the decisions shown to users. That produced a smaller suite with much more useful protection.

I also learned that integration testing requires discipline. A real n8n test is valuable because it proves that the application can communicate with the workflow, but running it automatically against production could create unwanted downstream effects. I therefore made the live integration test explicit and configurable through `N8N_TEST_WEBHOOK_URL`, while keeping deterministic tests in CI.

The main production mindset shift is simple: a demo proves that something works once; tests create evidence that important behavior still works after the next change. That is the difference I wanted this week to demonstrate. It turns reliability from an assumption into something the team can repeatedly verify before shipping. It gives future contributors a clear safety net before changes.
