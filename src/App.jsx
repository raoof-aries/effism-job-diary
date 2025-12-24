import React, { useRef, useEffect, useState } from "react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import "./App.css";
import initialData from "./data.json";

const App = () => {
  const hotTableRef = useRef(null);
  const containerRef = useRef(null);
  const [activeView, setActiveView] = useState("morning");
  const [customColumns, setCustomColumns] = useState({
    task: true,
    mainType: true,
    subType: true,
    unplan: true,
    jobNo: true,
    client: true,
    est: true,
    rate: true,
    act: true,
    target: true,
    outcome: true,
    cfDate: true,
    totalEst: true,
    status: true,
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const HOURLY_RATE = 500;

  const morningColumns = [
    "task",
    "mainType",
    "subType",
    "unplan",
    "jobNo",
    "client",
    "est",
    "rate",
  ];
  const eveningColumns = [
    "taskReference",
    "act",
    "target",
    "outcome",
    "cfDate",
    "totalEst",
    "status",
  ];
  const allColumnKeys = [
    ...morningColumns,
    "act",
    "target",
    "outcome",
    "cfDate",
    "totalEst",
    "status",
  ];

  const columnLabels = {
    task: "Task",
    mainType: "Main Type",
    subType: "SubType",
    unplan: "Unplan",
    jobNo: "Job No.",
    client: "Client",
    est: "Est",
    rate: "Rate",
    taskReference: "Task Info",
    act: "Act",
    target: "Target",
    outcome: "Outcome of the Task",
    cfDate: "CF Date",
    totalEst: "Total Est",
    status: "Status%",
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hours = String(h).padStart(2, "0");
        const minutes = String(m).padStart(2, "0");
        times.push(`${hours}:${minutes}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const timeToHours = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours + minutes / 60;
  };

  const calculateRate = (estTime) => {
    const hours = timeToHours(estTime);
    return hours * HOURLY_RATE;
  };

  const timeRenderer = (
    instance,
    td,
    row,
    col,
    prop,
    value,
    cellProperties
  ) => {
    Handsontable.renderers.TextRenderer(
      instance,
      td,
      row,
      col,
      prop,
      value,
      cellProperties
    );
    if (value) {
      td.style.color = "#dc2626";
      td.style.fontWeight = "600";
    }
    return td;
  };

  const rateRenderer = (
    instance,
    td,
    row,
    col,
    prop,
    value,
    cellProperties
  ) => {
    Handsontable.renderers.NumericRenderer(
      instance,
      td,
      row,
      col,
      prop,
      value,
      cellProperties
    );
    td.style.backgroundColor = "#f1f5f9";
    td.style.color = "#64748b";
    td.style.fontWeight = "500";
    td.style.fontStyle = "italic";
    td.style.cursor = "not-allowed";
    return td;
  };

  const taskReferenceRenderer = (
    instance,
    td,
    row,
    col,
    prop,
    value,
    cellProperties
  ) => {
    const taskValue = instance.getDataAtRowProp(row, "task");
    const estValue = instance.getDataAtRowProp(row, "est");

    td.innerHTML = "";
    td.style.backgroundColor = "#fafafa";
    td.style.padding = "10px 12px";
    td.style.verticalAlign = "middle";
    td.style.cursor = "default";
    td.style.borderLeft = "3px solid #e2e8f0";

    if (taskValue || estValue) {
      const taskDiv = document.createElement("div");
      taskDiv.style.color = "#334155";
      taskDiv.style.fontSize = "13px";
      taskDiv.style.fontWeight = "500";
      taskDiv.style.marginBottom = "6px";
      taskDiv.style.lineHeight = "1.4";
      taskDiv.textContent = taskValue || "—";

      const estDiv = document.createElement("div");
      estDiv.style.display = "flex";
      estDiv.style.alignItems = "center";
      estDiv.style.gap = "6px";
      estDiv.style.fontSize = "12px";

      const label = document.createElement("span");
      label.style.color = "#94a3b8";
      label.style.fontWeight = "500";
      label.textContent = "Est:";

      const time = document.createElement("span");
      time.style.color = "#dc2626";
      time.style.fontWeight = "600";
      time.textContent = estValue || "—";

      estDiv.appendChild(label);
      estDiv.appendChild(time);

      td.appendChild(taskDiv);
      td.appendChild(estDiv);
    } else {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.color = "#cbd5e1";
      emptyDiv.style.fontSize = "12px";
      emptyDiv.style.fontStyle = "italic";
      emptyDiv.textContent = "No task";
      td.appendChild(emptyDiv);
    }

    return td;
  };

  const getColumnConfig = (key) => {
    const configs = {
      task: { data: "task", type: "text" },
      mainType: {
        data: "mainType",
        type: "dropdown",
        source: [
          "Invoceable",
          "Non Invoiceable",
          "Personal Jobs",
          "Marketing & Branding",
        ],
      },
      subType: {
        data: "subType",
        type: "dropdown",
        source: [
          "Corrective action",
          "Idea",
          "Monthly management meeting",
          "Preventive action",
          "Training attended",
          "Training Provided",
          "Cash Collection",
          "Client Calls",
          "Client Emails",
          "Client Meetings",
          "Cost Controll",
          "Inter Division Contribution",
          "Client Complaint",
        ],
      },
      unplan: { data: "unplan", type: "checkbox", className: "htCenter" },
      jobNo: {
        data: "jobNo",
        type: "dropdown",
        source: [
          "Effism/2020/ESOL/Oper",
          "Effism/2020/ESOL/EFFISM",
          "Effism/2020/ESOL/IBC",
          "AES/JN/2024/HYDRAULICS",
          "AES/IN/2022/BIZEVENTS",
          "ESOL/AIMRI/LMS1.0/24",
          "ESOL/AMR/WEBS/24",
          "AES/JN/2024/EIT",
          "ESOL/AIMRIIN/WEBS/25",
          "ESOL/ONE/AM/WBS/25",
          "ESOL/AIMRI/EFSM 2.0/23",
          "AES/JN/2024/YACHTEK",
          "AES/JN/2022/AIMRIIND",
        ],
      },
      client: { data: "client", type: "text" },
      est: {
        data: "est",
        type: "dropdown",
        source: timeOptions,
        renderer: timeRenderer,
      },
      rate: {
        data: "rate",
        type: "numeric",
        readOnly: true,
        renderer: rateRenderer,
      },
      taskReference: {
        data: "task",
        type: "text",
        readOnly: true,
        renderer: taskReferenceRenderer,
        className: "task-reference-cell",
        width: 200,
      },
      act: {
        data: "act",
        type: "dropdown",
        source: timeOptions,
      },
      target: {
        data: "target",
        type: "date",
        dateFormat: "MM/DD/YYYY",
        correctFormat: true,
      },
      outcome: { data: "outcome", type: "text" },
      cfDate: {
        data: "cfDate",
        type: "date",
        dateFormat: "MM/DD/YYYY",
        correctFormat: true,
      },
      totalEst: {
        data: "totalEst",
        type: "dropdown",
        source: timeOptions,
      },
      status: {
        data: "status",
        type: "dropdown",
        source: [
          "100",
          "95",
          "90",
          "85",
          "80",
          "75",
          "70",
          "65",
          "60",
          "55",
          "50",
          "45",
        ],
      },
    };
    return configs[key];
  };

  const getVisibleColumns = () => {
    let visibleKeys;
    if (activeView === "morning") {
      visibleKeys = morningColumns;
    } else if (activeView === "evening") {
      visibleKeys = eveningColumns;
    } else if (activeView === "custom") {
      visibleKeys = allColumnKeys.filter((key) => customColumns[key]);
    } else {
      visibleKeys = allColumnKeys;
    }

    const headers = visibleKeys.map((key) => columnLabels[key]);
    const columns = visibleKeys.map((key) => getColumnConfig(key));

    return { headers, columns };
  };

  const updateTable = () => {
    if (!hotTableRef.current) return;

    const { headers, columns } = getVisibleColumns();
    hotTableRef.current.updateSettings({
      colHeaders: headers,
      columns: columns,
    });
  };

  useEffect(() => {
    updateTable();
  }, [activeView, customColumns]);

  useEffect(() => {
    if (containerRef.current && !hotTableRef.current) {
      const { headers, columns } = getVisibleColumns();

      const hot = new Handsontable(containerRef.current, {
        data: initialData,
        colHeaders: headers,
        columns: columns,
        rowHeaders: true,
        width: "100%",
        height: "auto",
        licenseKey: "non-commercial-and-evaluation",
        stretchH: "all",
        contextMenu: [
          "row_above",
          "row_below",
          "remove_row",
          "undo",
          "redo",
          "make_read_only",
          "alignment",
          "copy",
          "cut",
        ],
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: true,
        manualRowMove: true,
        columnSorting: {
          sortEmptyCells: true,
          indicator: true,
        },
        copyPaste: true,
        undo: true,
        search: true,
        comments: true,
        customBorders: true,
        minSpareRows: 1,
        afterChange: (changes, source) => {
          if (source === "loadData" || !changes) return;

          changes.forEach(([row, prop, oldValue, newValue]) => {
            if (prop === "est") {
              const rate = calculateRate(newValue);
              hot.setDataAtRowProp(row, "rate", rate, "auto-calculation");
            }
          });

          if (activeView === "evening") {
            hot.render();
          }
        },
      });

      const data = hot.getData();
      data.forEach((row, index) => {
        const estValue = hot.getDataAtRowProp(index, "est");
        if (estValue) {
          const rate = calculateRate(estValue);
          hot.setDataAtRowProp(index, "rate", rate, "loadData");
        }
      });

      hotTableRef.current = hot;
    }

    return () => {
      if (hotTableRef.current) {
        hotTableRef.current.destroy();
        hotTableRef.current = null;
      }
    };
  }, []);

  const toggleColumn = (key) => {
    setCustomColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Task Management Table</h1>
        <p className="subtitle">
          Track and manage your project tasks efficiently
        </p>
      </div>

      <div className="table-wrapper">
        <div className="controls">
          <div className="view-tabs">
            <button
              className={`tab ${activeView === "morning" ? "active" : ""}`}
              onClick={() => setActiveView("morning")}
            >
              <span className="tab-icon">☀️</span>
              Morning Entry
            </button>
            <button
              className={`tab ${activeView === "evening" ? "active" : ""}`}
              onClick={() => setActiveView("evening")}
            >
              <span className="tab-icon">🌙</span>
              Evening Review
            </button>
            <button
              className={`tab ${activeView === "all" ? "active" : ""}`}
              onClick={() => setActiveView("all")}
            >
              <span className="tab-icon">📋</span>
              Complete View
            </button>
            <button
              className={`tab ${activeView === "custom" ? "active" : ""}`}
              onClick={() => {
                setActiveView("custom");
                setShowColumnSelector(!showColumnSelector);
              }}
            >
              <span className="tab-icon">⚙️</span>
              Custom View
            </button>
          </div>

          {activeView === "custom" && showColumnSelector && (
            <div className="column-selector">
              <h3>Select Columns to Display</h3>
              <div className="column-grid">
                {allColumnKeys.map((key) => (
                  <label key={key} className="column-checkbox">
                    <input
                      type="checkbox"
                      checked={customColumns[key]}
                      onChange={() => toggleColumn(key)}
                    />
                    <span>{columnLabels[key]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={containerRef} className="handsontable-container"></div>
      </div>
    </div>
  );
};

export default App;
