# Priority vs SRTF Scheduling Simulator

## Project Description
This project is a CPU Scheduling Simulator that compares two preemptive scheduling algorithms: Priority Scheduling and SRTF (Shortest Remaining Time First). The user enters processes, runs the simulation, and the system displays Gantt charts, results tables, a comparison summary, analysis questions, and a conclusion.

## Features
- Add processes with Process ID, Arrival Time, Burst Time, and Priority.
- Validate invalid inputs and show error messages.
- Load preset test scenarios A, B, C, and D.
- Compare Priority Scheduling and SRTF on the same workload.
- Display Gantt charts for both algorithms.
- Calculate Waiting Time, Turnaround Time, and Response Time.
- Show comparison summary, analysis answers, and final conclusion.

## How to Run
1. Open `os-project.html` in a web browser.
2. Add processes manually or load one of the preset scenarios.
3. Click `Run Simulation`.
4. View the Gantt charts, results tables, comparison summary, analysis answers, and conclusion.

## Repository Contents
- `os-project.html` — main simulator file.
- `README.md` — project overview and instructions.
- `Documentation-draft.docx` — documentation with screenshots.
- `test-cases.md` — short description of the test scenarios.

## Test Scenarios
- Scenario A: Basic mixed workload.
- Scenario B: Priority vs burst conflict.
- Scenario C: Starvation-sensitive case.
- Scenario D: Validation case.

## Team Members
- Name 1 — ID
- Name 2 — ID
- Name 3 — ID

## Notes
- No time quantum is used because this project compares Priority Scheduling and SRTF.
- The same workload is used for both algorithms to ensure a fair comparison.
