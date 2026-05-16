const COLORS = [
        "#4f6ef7",
        "#f07c3a",
        "#16a34a",
        "#dc2626",
        "#0891b2",
        "#7c3aed",
        "#d97706",
        "#db2777",
        "#059669",
        "#6b7280",
      ];

      const SCENARIOS = {

        A: {
          title: "Scenario A — Basic Mixed Workload",
          desc: "A normal workload with multiple processes, different arrival times, and different burst times. Tests general scheduling behavior for both Priority and SRTF algorithms.",
          procs: [
            { id: "P1", arrival: 0, burst: 8, priority: 3 },
            { id: "P2", arrival: 1, burst: 4, priority: 1 },
            { id: "P3", arrival: 2, burst: 9, priority: 2 },
            { id: "P4", arrival: 3, burst: 5, priority: 4 },
            { id: "P5", arrival: 4, burst: 3, priority: 2 },
          ],
        },

        B: {
          title: "Scenario B — Conflict Between Priority and Burst Time",
          desc: "P1 has high priority (1) but a long burst (12). P2 has low priority (4) but a very short burst (2). Priority Scheduling will run P1 continuously even though it is long. SRTF will immediately preempt P1 when P2 arrives because P2 has a shorter remaining time — even though P2 has lower priority.",
          procs: [
            { id: "P1", arrival: 0, burst: 12, priority: 1 },
            { id: "P2", arrival: 2, burst: 2, priority: 4 },
            { id: "P3", arrival: 3, burst: 6, priority: 2 },
            { id: "P4", arrival: 5, burst: 4, priority: 3 },
          ],
        },

        C: {
          title: "Scenario C — Starvation-Sensitive Case",
          desc: "P4 has the lowest priority (5) and may wait a long time under Priority Scheduling because higher-priority processes keep arriving. Under SRTF, P4 also risks long waits because its burst (8) is much longer than the other processes, and shorter jobs keep arriving and preempting it. Shows how each policy creates starvation risk for different types of processes.",
          procs: [
            { id: "P1", arrival: 0, burst: 4, priority: 1 },
            { id: "P2", arrival: 1, burst: 3, priority: 1 },
            { id: "P3", arrival: 2, burst: 2, priority: 2 },
            { id: "P4", arrival: 3, burst: 8, priority: 5 },
            { id: "P5", arrival: 4, burst: 2, priority: 1 },
          ],
        },

        D: {
          title: "Scenario D — Validation Case",
          desc: "Demonstrates how the simulator safely rejects all types of invalid input. The panel above lists every invalid case and the exact error message produced. A valid workload is loaded so the simulation can proceed after reviewing the validation behavior.",
          procs: [
            { id: "P1", arrival: 0, burst: 6, priority: 2 },
            { id: "P2", arrival: 1, burst: 4, priority: 1 },
            { id: "P3", arrival: 2, burst: 5, priority: 3 },
            { id: "P4", arrival: 3, burst: 3, priority: 1 },
          ],
        },
      };

      let processList = [];

      function validateField(inputId, errorId, value, rules) {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);

        inputEl.classList.remove("has-error");
        errorEl.textContent = "";

        if (rules.required && value.trim() === "") {
          inputEl.classList.add("has-error");
          errorEl.textContent = "Required";
          return false;
        }

        if (rules.numeric && isNaN(Number(value))) {
          inputEl.classList.add("has-error");
          errorEl.textContent = "Must be a number";
          return false;
        }

        const num = Number(value);

        if (rules.min !== undefined && num < rules.min) {
          inputEl.classList.add("has-error");
          errorEl.textContent = `Must be ≥ ${rules.min}`;
          return false;
        }

        if (rules.max !== undefined && num > rules.max) {
          inputEl.classList.add("has-error");
          errorEl.textContent = `Max: ${rules.max}`;
          return false;
        }

        if (rules.alphaNum && !/^[A-Za-z0-9_-]+$/.test(value)) {
          inputEl.classList.add("has-error");
          errorEl.textContent = "Letters & digits only";
          return false;
        }

        return true;
      }

      function addProcess() {
        const pid = document.getElementById("inp-pid").value.trim();
        const arrival = document.getElementById("inp-arrival").value;
        const burst = document.getElementById("inp-burst").value;
        const priority = document.getElementById("inp-priority").value;

        document.getElementById("err-general").textContent = "";

        let valid = true;
        valid &= validateField("inp-pid", "err-pid", pid, {
          required: true,
          alphaNum: true,
        });
        valid &= validateField("inp-arrival", "err-arrival", arrival, {
          required: true,
          numeric: true,
          min: 0,
          max: 9999,
        });
        valid &= validateField("inp-burst", "err-burst", burst, {
          required: true,
          numeric: true,
          min: 1,
          max: 999,
        });
        valid &= validateField("inp-priority", "err-priority", priority, {
          required: true,
          numeric: true,
          min: 1,
          max: 99,
        });
        if (!valid) return;

        if (processList.find((p) => p.id === pid)) {
          document.getElementById("inp-pid").classList.add("has-error");
          document.getElementById("err-pid").textContent = "Duplicate ID";
          return;
        }

        if (processList.length >= 15) {
          document.getElementById("err-general").textContent =
            "Maximum 15 processes.";
          return;
        }

        processList.push({
          id: pid,
          arrival: Number(arrival),
          burst: Number(burst),
          priority: Number(priority),
        });

        renderProcessTable();

        document.getElementById("inp-pid").value =
          "P" + (processList.length + 1);
        ["inp-arrival", "inp-burst", "inp-priority"].forEach((id) => {
          document.getElementById(id).value = "";
        });
        ["inp-pid", "inp-arrival", "inp-burst", "inp-priority"].forEach(
          (id) => {
            document.getElementById(id).classList.remove("has-error");
          },
        );
        ["err-pid", "err-arrival", "err-burst", "err-priority"].forEach(
          (id) => {
            document.getElementById(id).textContent = "";
          },
        );
      }

      function removeProcess(index) {
        processList.splice(index, 1);
        renderProcessTable();
      }

      function loadScenario(key) {

        document
          .querySelectorAll(".btn-sc")
          .forEach((b) => b.classList.remove("active"));
        document.getElementById("sc-" + key).classList.add("active");

        const s = SCENARIOS[key];

        document.getElementById("sc-info").innerHTML =
          `<strong>${s.title}</strong><br>${s.desc}`;

        document
          .getElementById("val-demo")
          .classList.toggle("hidden", key !== "D");

        processList = s.procs.map((p) => ({ ...p }));

        document.getElementById("results").classList.add("hidden");

        clearErrors();
        renderProcessTable();
      }

      function clearAll() {
        processList = [];
        document.getElementById("sc-info").textContent =
          "Select a scenario above or add processes manually using the Input Panel.";
        document.getElementById("val-demo").classList.add("hidden");
        document.getElementById("results").classList.add("hidden");
        document.getElementById("inp-pid").value = "P1";
        ["inp-arrival", "inp-burst", "inp-priority"].forEach((id) => {
          document.getElementById(id).value = "";
        });
        document
          .querySelectorAll(".btn-sc")
          .forEach((b) => b.classList.remove("active"));
        clearErrors();
        renderProcessTable();
      }

      function clearErrors() {
        ["inp-pid", "inp-arrival", "inp-burst", "inp-priority"].forEach(
          (id) => {
            document.getElementById(id).classList.remove("has-error");
          },
        );
        [
          "err-pid",
          "err-arrival",
          "err-burst",
          "err-priority",
          "err-general",
        ].forEach((id) => {
          document.getElementById(id).textContent = "";
        });
      }

      function buildColorMap() {
        const map = {};
        processList.forEach((p, i) => {
          map[p.id] = COLORS[i % COLORS.length];
        });
        return map;
      }

      function renderProcessTable() {
        const container = document.getElementById("process-table");

        if (processList.length === 0) {
          container.innerHTML =
            '<div class="empty-state">No processes yet. Add processes above or load a scenario.</div>';
          return;
        }

        let html = `
        <table class="proc-table">
          <thead>
            <tr>
              <th></th>
              <th>Process ID</th>
              <th>Arrival Time</th>
              <th>Burst Time</th>
              <th>Priority</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
      `;

        processList.forEach((p, i) => {
          const color = COLORS[i % COLORS.length];
          html += `
          <tr>
            <td><span class="dot" style="background:${color};"></span></td>
            <td><strong>${p.id}</strong></td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            <td>${p.priority}</td>
            <td><button class="btn-del" onclick="removeProcess(${i})">✕</button></td>
          </tr>
        `;
        });

        html += "</tbody></table>";
        container.innerHTML = html;
      }

      function runPriority(inputProcesses) {

        const processes = inputProcesses.map((p) => ({
          ...p,
          remaining: p.burst,
          firstRun: -1,
          endTime: -1,
        }));

        let clock = 0;
        let ganttSegments = [];
        let done = 0;

        while (done < processes.length) {

          const available = processes.filter(
            (p) => p.arrival <= clock && p.remaining > 0,
          );

          if (available.length === 0) {
            const next = processes
              .filter((p) => p.remaining > 0)
              .sort((a, b) => a.arrival - b.arrival)[0];
            clock = next.arrival;
            continue;
          }

          available.sort(
            (a, b) =>
              a.priority - b.priority ||
              a.arrival - b.arrival ||
              a.id.localeCompare(b.id),
          );

          const winner = available[0];

          if (winner.firstRun === -1) winner.firstRun = clock;

          const threat = processes
            .filter(
              (p) =>
                p.arrival > clock &&
                p.remaining > 0 &&
                p.priority < winner.priority,
            )
            .sort((a, b) => a.arrival - b.arrival)[0];

          const finishAt = clock + winner.remaining;
          const stopAt = threat ? Math.min(finishAt, threat.arrival) : finishAt;

          ganttSegments.push({ pid: winner.id, start: clock, end: stopAt });
          winner.remaining -= stopAt - clock;
          clock = stopAt;

          if (winner.remaining === 0) {
            winner.endTime = clock;
            done++;
          }
        }

        const merged = [];
        for (const seg of ganttSegments) {
          const last = merged[merged.length - 1];
          if (last && last.pid === seg.pid && last.end === seg.start) {
            last.end = seg.end;
          } else {
            merged.push({ ...seg });
          }
        }

        return { processes, ganttSegments: merged };
      }

      function runSRTF(inputProcesses) {

        const processes = inputProcesses.map((p) => ({
          ...p,
          remaining: p.burst,
          firstRun: -1,
          endTime: -1,
        }));

        let clock = 0;
        let ganttSegments = [];
        let done = 0;

        while (done < processes.length) {

          const available = processes.filter(
            (p) => p.arrival <= clock && p.remaining > 0,
          );

          if (available.length === 0) {
            const next = processes
              .filter((p) => p.remaining > 0)
              .sort((a, b) => a.arrival - b.arrival)[0];
            clock = next.arrival;
            continue;
          }

          available.sort(
            (a, b) =>
              a.remaining - b.remaining ||
              a.arrival - b.arrival ||
              a.id.localeCompare(b.id),
          );

          const winner = available[0];

          if (winner.firstRun === -1) winner.firstRun = clock;

          let stopAt = clock + winner.remaining;

          const futureArrivals = processes
            .filter((p) => p.arrival > clock && p.remaining > 0)
            .sort((a, b) => a.arrival - b.arrival);

          for (const future of futureArrivals) {
            const timeGap = future.arrival - clock;
            const winnerRemainingThen = winner.remaining - timeGap;

            if (winnerRemainingThen > 0 && future.burst < winnerRemainingThen) {
              stopAt = future.arrival;
              break;
            }
          }

          ganttSegments.push({ pid: winner.id, start: clock, end: stopAt });
          winner.remaining -= stopAt - clock;
          clock = stopAt;

          if (winner.remaining === 0) {
            winner.endTime = clock;
            done++;
          }
        }

        const merged = [];
        for (const seg of ganttSegments) {
          const last = merged[merged.length - 1];
          if (last && last.pid === seg.pid && last.end === seg.start) {
            last.end = seg.end;
          } else {
            merged.push({ ...seg });
          }
        }

        return { processes, ganttSegments: merged };
      }

      function calcMetrics(processes) {
        return processes.map((p) => ({
          id: p.id,
          arrival: p.arrival,
          burst: p.burst,
          priority: p.priority,
          ct: p.endTime,
          tat: p.endTime - p.arrival,
          wt: p.endTime - p.arrival - p.burst,
          rt: p.firstRun - p.arrival,
        }));
      }

      function calcAverages(metrics) {
        const n = metrics.length;
        return {
          wt: +(metrics.reduce((s, m) => s + m.wt, 0) / n).toFixed(2),
          tat: +(metrics.reduce((s, m) => s + m.tat, 0) / n).toFixed(2),
          rt: +(metrics.reduce((s, m) => s + m.rt, 0) / n).toFixed(2),
        };
      }

      function insertIdleBlocks(segments) {

        const result = [];
        let t = 0;
        for (const seg of segments) {
          if (seg.start > t) {
            result.push({ pid: "IDLE", start: t, end: seg.start });
          }
          result.push({ ...seg });
          t = seg.end;
        }
        return result;
      }

      function renderGantt(trackId, axisId, segments, colorMap) {
        const track = document.getElementById(trackId);
        const axis = document.getElementById(axisId);

        const full = insertIdleBlocks(segments);
        const totalTime = full[full.length - 1].end;

        const available = Math.min(window.innerWidth - 80, 1000);
        const scale = Math.max(18, Math.min(54, available / totalTime));

        let html = "";
        for (const seg of full) {
          const width = (seg.end - seg.start) * scale;
          const isIdle = seg.pid === "IDLE";
          const bg = isIdle
            ? ""
            : `background: ${colorMap[seg.pid] || "#888"};`;
          const label = width > 24 ? seg.pid : "";
          const tip = `${seg.pid}: [${seg.start} – ${seg.end}] (${seg.end - seg.start} unit${seg.end - seg.start !== 1 ? "s" : ""})`;

          html += `
          <div class="g-block ${isIdle ? "idle" : ""}"
               style="${bg} width: ${width}px;"
               title="${tip}">
            ${label}
          </div>
        `;
        }

        track.innerHTML = html;

        const interval = totalTime <= 15 ? 1 : totalTime <= 40 ? 2 : 5;
        let ticks = "";
        const appendTick = (time) => {
          const left = time * scale;
          const transform =
            time === 0
              ? "transform:none;"
              : time === totalTime
                ? "transform:translateX(-100%);"
                : "";
          ticks += `<span class="g-tick" style="left:${left}px; ${transform}">${time}</span>`;
        };

        for (let t = 0; t <= totalTime; t += interval) {
          appendTick(t);
        }

        if (totalTime % interval !== 0) {
          appendTick(totalTime);
        }

        axis.innerHTML = ticks;
        axis.style.minWidth = (totalTime + 2) * scale + "px";
      }

      function renderResultsTable(containerId, metrics, colorMap, isSRTF) {
        const avgs = calcAverages(metrics);

        let html = `
        <table class="res-table">
          <thead>
            <tr>
              <th>Process</th>
              <th>Arrival</th>
              <th>Burst</th>
              <th>Priority</th>
              <th>Completion</th>
              <th>TAT</th>
              <th>WT</th>
              <th>RT</th>
            </tr>
          </thead>
          <tbody>
      `;

        metrics.forEach((m) => {
          const color = colorMap[m.id] || "#888";
          html += `
          <tr>
            <td>
              <span class="dot" style="background:${color};"></span>
              ${m.id}
            </td>
            <td>${m.arrival}</td>
            <td>${m.burst}</td>
            <td>${m.priority}</td>
            <td>${m.ct}</td>
            <td>${m.tat}</td>
            <td>${m.wt}</td>
            <td>${m.rt}</td>
          </tr>
        `;
        });

        const avgClass = isSRTF ? "avg-row srtf" : "avg-row";
        html += `
        <tr class="${avgClass}">
          <td colspan="5" style="text-align:right;">Averages →</td>
          <td>${avgs.tat}</td>
          <td>${avgs.wt}</td>
          <td>${avgs.rt}</td>
        </tr>
        </tbody>
        </table>
      `;

        document.getElementById(containerId).innerHTML = html;
        return avgs;
      }

      function renderComparison(priAvgs, srtfAvgs) {

        const metrics = [
          { label: "Avg Waiting Time", pri: priAvgs.wt, srtf: srtfAvgs.wt },
          {
            label: "Avg Turnaround Time",
            pri: priAvgs.tat,
            srtf: srtfAvgs.tat,
          },
          { label: "Avg Response Time", pri: priAvgs.rt, srtf: srtfAvgs.rt },
        ];

        let cardsHtml = "";
        metrics.forEach((m) => {
          const tie = Math.abs(m.pri - m.srtf) < 0.001;
          const priCls = tie ? "tie" : m.pri <= m.srtf ? "win" : "lose";
          const srtfCls = tie ? "tie" : m.srtf < m.pri ? "win" : "lose";

          cardsHtml += `
          <div class="m-card">
            <div class="m-lbl">${m.label}</div>
            <div class="m-vals">
              <div class="m-val">
                <span class="m-name" style="color:var(--blue);">Priority</span>
                <span class="m-num ${priCls}">${m.pri.toFixed(2)}</span>
              </div>
              <div class="m-val">
                <span class="m-name" style="color:var(--teal);">SRTF</span>
                <span class="m-num ${srtfCls}">${m.srtf.toFixed(2)}</span>
              </div>
            </div>
          </div>
        `;
        });

        document.getElementById("metric-cards").innerHTML = cardsHtml;

        const rows = [
          {
            lbl: "Avg Waiting Time",
            pv: priAvgs.wt.toFixed(2),
            sv: srtfAvgs.wt.toFixed(2),
            priWins: priAvgs.wt <= srtfAvgs.wt + 0.001,
          },
          {
            lbl: "Avg Turnaround Time",
            pv: priAvgs.tat.toFixed(2),
            sv: srtfAvgs.tat.toFixed(2),
            priWins: priAvgs.tat <= srtfAvgs.tat + 0.001,
          },
          {
            lbl: "Avg Response Time",
            pv: priAvgs.rt.toFixed(2),
            sv: srtfAvgs.rt.toFixed(2),
            priWins: priAvgs.rt <= srtfAvgs.rt + 0.001,
          },
          {
            lbl: "Selection Rule",
            pv: "Lowest priority number",
            sv: "Shortest remaining time",
            sp: true,
            neutral: true,
          },
          {
            lbl: "Short Job with Low Priority",
            pv: "Delayed (priority ignored)",
            sv: "Runs immediately (shortest)",
            sp: true,
            priLose: true,
          },
          {
            lbl: "Long Job with High Priority",
            pv: "Runs fully first",
            sv: "Preempted by shorter arrivals",
            sp: true,
            priWin: true,
          },
          {
            lbl: "Starvation Risk",
            pv: "Low-priority processes",
            sv: "Long-burst processes",
            sp: true,
            warnBoth: true,
          },
          {
            lbl: "Urgency Support",
            pv: "Yes — priority-based",
            sv: "None — ignores priority",
            sp: true,
            priWin: true,
          },
          {
            lbl: "Optimal Avg WT",
            pv: "Not optimal",
            sv: "Provably optimal",
            sp: true,
            srtfWin: true,
          },
        ];

        let rowsHtml = "";
        rows.forEach((row) => {
          let priChip, srtfChip;

          if (!row.sp) {

            priChip = row.priWins ? "win" : "lose";
            srtfChip = row.priWins ? "lose" : "win";
          } else if (row.neutral) {
            priChip = "info";
            srtfChip = "teal";
          } else if (row.warnBoth) {
            priChip = "warn";
            srtfChip = "warn";
          } else if (row.priLose) {
            priChip = "lose";
            srtfChip = "win";
          } else if (row.priWin) {
            priChip = "win";
            srtfChip = "lose";
          } else if (row.srtfWin) {
            priChip = "lose";
            srtfChip = "win";
          } else {
            priChip = "info";
            srtfChip = "teal";
          }

          rowsHtml += `
          <div class="cmp-row">
            <div class="chip ${priChip}">${row.pv}</div>
            <div class="cmp-lbl">${row.lbl}</div>
            <div class="chip ${srtfChip}">${row.sv}</div>
          </div>
        `;
        });

        document.getElementById("cmp-rows").innerHTML = rowsHtml;
      }

      function renderAnalysis(priAvgs, srtfAvgs) {
        const priWinsWT = priAvgs.wt <= srtfAvgs.wt + 0.001;
        const priWinsRT = priAvgs.rt <= srtfAvgs.rt + 0.001;
        const priWinsTAT = priAvgs.tat <= srtfAvgs.tat + 0.001;

        const questions = [

          {
            q: "Q1. Which algorithm produced the lower average waiting time?",
            a: priWinsWT
              ? `Priority Scheduling produced the lower average WT (<strong>${priAvgs.wt.toFixed(2)}</strong> vs SRTF: <strong>${srtfAvgs.wt.toFixed(2)}</strong>). On this particular workload, serving high-priority processes early reduced overall waiting. Note that this is not the general case — SRTF is theoretically optimal for average waiting time across all workloads.`
              : `SRTF produced the lower average WT (<strong>${srtfAvgs.wt.toFixed(2)}</strong> vs Priority: <strong>${priAvgs.wt.toFixed(2)}</strong>). This is consistent with SRTF's theoretical property — it is provably optimal for minimizing average waiting time by always selecting the process with the shortest remaining burst, which minimizes the time other processes spend waiting behind it.`,
          },

          {
            q: "Q2. Which algorithm produced the lower average response time?",
            a: priWinsRT
              ? `Priority Scheduling produced the lower average RT (<strong>${priAvgs.rt.toFixed(2)}</strong> vs SRTF: <strong>${srtfAvgs.rt.toFixed(2)}</strong>). High-priority processes received CPU access almost immediately upon arrival, pulling the average down significantly — though low-priority processes may have waited much longer for their first CPU access.`
              : `SRTF produced the lower average RT (<strong>${srtfAvgs.rt.toFixed(2)}</strong> vs Priority: <strong>${priAvgs.rt.toFixed(2)}</strong>). Because SRTF always chooses the shortest remaining job, short processes received their first CPU access very quickly, which reduced the average response time across the entire process set.`,
          },

          {
            q: "Q3. Did priority values improve the treatment of urgent processes?",
            a: `Yes. Under Priority Scheduling, processes with a lower priority number were always selected first among all ready processes and could immediately preempt a currently running lower-priority process. This guaranteed that urgent, high-priority work was never delayed behind less important tasks. Under SRTF, priority values are completely ignored — a process with priority=1 and a long burst will be preempted by a newly arrived short-burst process regardless of how critical it is. The behavior is clearly visible in Scenario B, where Priority Scheduling ran P1 (priority=1, burst=12) without interruption, while SRTF immediately preempted it when the shorter P2 arrived.`,
          },

          {
            q: "Q4. Did SRTF favor short jobs more aggressively?",
            a: `Yes. SRTF is inherently aggressive in favoring short jobs. At every point in time, it selects the process with the shortest remaining burst and immediately preempts the current process the moment a shorter one arrives — without considering priority, arrival order, or how long other processes have been waiting. This aggressive behavior toward short jobs is why SRTF achieves optimal average waiting time but can cause long-burst processes to wait excessively (starvation-like behavior) when short processes keep arriving continuously. In Scenario C, P4 (burst=8) experienced significantly higher waiting time compared to shorter processes under both algorithms, but especially under SRTF.`,
          },

          {
            q: "Q5. Which algorithm would you recommend for the tested workload, and why?",
            a: (() => {
              const wins = [priWinsWT, priWinsTAT, priWinsRT].filter(
                Boolean,
              ).length;
              if (wins >= 2) {
                return `<strong>Priority Scheduling</strong> is recommended for this workload. It outperformed SRTF on ${wins} of 3 average metrics and correctly served urgent processes with appropriate speed. It is best suited for systems where processes have genuinely different levels of importance — such as real-time, operating system, or mixed-criticality environments — provided an aging mechanism is implemented to prevent low-priority starvation.`;
              } else {
                return `<strong>SRTF</strong> is recommended for this workload. It outperformed Priority Scheduling on ${3 - wins} of 3 average metrics. SRTF minimizes average waiting time by design, making it the better choice for batch processing or throughput-focused environments where all processes are treated equally and the primary goal is to minimize overall wait. It should not be used in systems with genuine urgency requirements, since it ignores priority entirely.`;
              }
            })(),
          },
        ];

        const html = questions
          .map(
            (qa) => `
        <div class="qa-item">
          <div class="qa-q">${qa.q}</div>
          <div class="qa-a">${qa.a}</div>
        </div>
      `,
          )
          .join("");

        document.getElementById("qa-list").innerHTML = html;
      }

      function renderConclusion(priAvgs, srtfAvgs) {
        const priWinsWT = priAvgs.wt <= srtfAvgs.wt + 0.001;
        const priWinsTAT = priAvgs.tat <= srtfAvgs.tat + 0.001;
        const priWinsRT = priAvgs.rt <= srtfAvgs.rt + 0.001;
        const wins = [priWinsWT, priWinsTAT, priWinsRT].filter(Boolean).length;
        const overall = wins >= 2 ? "Priority Scheduling" : "SRTF";

        document.getElementById("conclusion").innerHTML = `

        <div class="conc-pt">
          <div class="conc-lbl">1 — Which algorithm performed better on the selected datasets</div>
          <div class="conc-txt">
            <strong>${overall}</strong> delivered better overall performance, winning
            ${wins >= 2 ? wins : 3 - wins} out of 3 average metric comparisons on this workload.<br>
            Avg WT  → Priority: <strong>${priAvgs.wt.toFixed(2)}</strong>,  SRTF: <strong>${srtfAvgs.wt.toFixed(2)}</strong>
            (winner: ${priWinsWT ? "Priority" : "SRTF"}).<br>
            Avg TAT → Priority: <strong>${priAvgs.tat.toFixed(2)}</strong>, SRTF: <strong>${srtfAvgs.tat.toFixed(2)}</strong>
            (winner: ${priWinsTAT ? "Priority" : "SRTF"}).<br>
            Avg RT  → Priority: <strong>${priAvgs.rt.toFixed(2)}</strong>,  SRTF: <strong>${srtfAvgs.rt.toFixed(2)}</strong>
            (winner: ${priWinsRT ? "Priority" : "SRTF"}).
          </div>
        </div>

        <div class="conc-pt">
          <div class="conc-lbl">2 — Which metrics were better under each algorithm</div>
          <div class="conc-txt">
            <strong>Priority Scheduling was better at:</strong>
            serving urgent processes — high-priority processes received CPU access immediately
            and could preempt lower-priority ones at any time. This produced faster response
            times for critical work and ensured that important tasks were never blocked by
            less urgent ones. On workloads where high-priority processes also have short
            bursts, Priority can also improve waiting time.<br><br>
            <strong>SRTF was better at:</strong>
            minimizing overall average waiting time and turnaround time across all processes.
            Because SRTF always picks the shortest remaining job, it reduces the time that
            processes spend waiting behind other work. SRTF is provably optimal for average
            waiting time — no other algorithm can achieve a lower average WT on the same
            workload.
          </div>
        </div>

        <div class="conc-pt">
          <div class="conc-lbl">3 — Main trade-off observed</div>
          <div class="conc-txt">
            The fundamental trade-off is <strong>policy-driven service (Priority) versus
            efficiency-driven service (SRTF)</strong>.
            Priority Scheduling assigns CPU time based on declared importance — urgent tasks
            are guaranteed fast access, but a long high-priority process can block many
            short lower-priority processes, which may waste CPU time.
            SRTF assigns CPU time based purely on burst length — it maximizes throughput and
            minimizes average waiting time, but it completely ignores urgency and can
            indefinitely delay long-burst processes when short ones keep arriving.
            The choice between them depends on whether the system needs
            <em>urgency awareness</em> or <em>time efficiency</em>.
          </div>
        </div>

        <div class="conc-pt">
          <div class="conc-lbl">4 — Which algorithm appeared fairer in practice</div>
          <div class="conc-txt">
            Neither algorithm is universally fair, but they are unfair in different ways.
            <strong>Priority Scheduling</strong> is unfair to low-priority processes — they
            risk being indefinitely bypassed (starvation) if higher-priority processes keep
            arriving. The standard mitigation is an <em>aging mechanism</em> that gradually
            raises the priority of long-waiting processes.<br>
            <strong>SRTF</strong> is unfair to long-burst processes — they are repeatedly
            preempted by shorter arrivals and can wait far longer than short processes,
            with no built-in protection mechanism.<br>
            In practice, <strong>Priority Scheduling with aging</strong> is considered the
            fairer option in most real-world systems because it respects human-assigned
            importance while providing a mechanism (aging) to guarantee eventual service
            for all processes — whereas SRTF has no inherent protection for long-burst
            processes at all.
          </div>
        </div>
      `;
      }

      function runSimulation() {

        if (processList.length < 2) {
          alert(
            "Please add at least 2 processes before running the simulation.",
          );
          return;
        }

        const colorMap = buildColorMap();

        const priResult = runPriority(processList);
        const priMetrics = calcMetrics(priResult.processes);

        const srtfResult = runSRTF(processList);
        const srtfMetrics = calcMetrics(srtfResult.processes);

        renderGantt("gantt-pri", "axis-pri", priResult.ganttSegments, colorMap);
        renderGantt(
          "gantt-srtf",
          "axis-srtf",
          srtfResult.ganttSegments,
          colorMap,
        );

        const priAvgs = renderResultsTable(
          "table-pri",
          priMetrics,
          colorMap,
          false,
        );
        const srtfAvgs = renderResultsTable(
          "table-srtf",
          srtfMetrics,
          colorMap,
          true,
        );

        renderComparison(priAvgs, srtfAvgs);

        renderAnalysis(priAvgs, srtfAvgs);

        renderConclusion(priAvgs, srtfAvgs);

        document.getElementById("results").classList.remove("hidden");

        setTimeout(() => {
          document
            .getElementById("results")
            .scrollIntoView({ behavior: "smooth" });
        }, 60);
      }

      document.getElementById("inp-pid").value = "P1";
      renderProcessTable();
