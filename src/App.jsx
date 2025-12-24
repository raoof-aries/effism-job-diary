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
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [taskData, setTaskData] = useState(initialData);

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

  const toggleCard = (index) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleFieldChange = (index, field, value) => {
    setTaskData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };

      if (field === "est") {
        newData[index].rate = calculateRate(value);
      }

      // Also update Handsontable if it exists
      if (hotTableRef.current) {
        hotTableRef.current.setDataAtRowProp(index, field, value);
        if (field === "est") {
          hotTableRef.current.setDataAtRowProp(
            index,
            "rate",
            newData[index].rate
          );
        }
      }

      return newData;
    });
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
        data: taskData,
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

          // Sync with state
          setTaskData(hot.getSourceData());

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

  const MobileAccordion = () => {
    return (
      <div className="mobile-accordion">
        {taskData.map((row, index) => {
          const isExpanded = expandedCards.has(index);
          const statusValue = row.status || "0";
          const statusColor =
            parseInt(statusValue) >= 75
              ? "#10b981"
              : parseInt(statusValue) >= 50
              ? "#f59e0b"
              : "#ef4444";

          return (
            <div key={index} className="accordion-card">
              <div className="card-header" onClick={() => toggleCard(index)}>
                <div className="card-header-main">
                  <div className="card-title">
                    {row.task || "Untitled Task"}
                  </div>
                  <div className="card-meta">
                    <span className="meta-item">
                      <span className="meta-label">Est:</span>
                      <span className="meta-value time">{row.est || "—"}</span>
                    </span>
                    <span className="meta-item">
                      <span className="meta-label">Act:</span>
                      <span className="meta-value time">{row.act || "—"}</span>
                    </span>
                    <span
                      className="meta-item status-badge"
                      style={{ backgroundColor: statusColor }}
                    >
                      {statusValue}%
                    </span>
                  </div>
                </div>
                <button className="expand-button">
                  {isExpanded ? "−" : "+"}
                </button>
              </div>

              {isExpanded && (
                <div className="card-body">
                  <div className="field-group">
                    <label>Task</label>
                    <input
                      type="text"
                      value={row.task || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "task", e.target.value)
                      }
                    />
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label>Main Type</label>
                      <select
                        value={row.mainType || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "mainType", e.target.value)
                        }
                      >
                        <option value="">Select...</option>
                        <option>Invoceable</option>
                        <option>Non Invoiceable</option>
                        <option>Personal Jobs</option>
                        <option>Marketing & Branding</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label>SubType</label>
                      <select
                        value={row.subType || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "subType", e.target.value)
                        }
                      >
                        <option value="">Select...</option>
                        <option>Corrective action</option>
                        <option>Idea</option>
                        <option>Monthly management meeting</option>
                        <option>Preventive action</option>
                        <option>Training attended</option>
                        <option>Training Provided</option>
                        <option>Cash Collection</option>
                        <option>Client Calls</option>
                        <option>Client Emails</option>
                        <option>Client Meetings</option>
                        <option>Cost Controll</option>
                        <option>Inter Division Contribution</option>
                        <option>Client Complaint</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field-group checkbox-field">
                      <label>
                        <input
                          type="checkbox"
                          checked={row.unplan || false}
                          onChange={(e) =>
                            handleFieldChange(index, "unplan", e.target.checked)
                          }
                        />
                        <span>Unplanned</span>
                      </label>
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Job No.</label>
                    <select
                      value={row.jobNo || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "jobNo", e.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      <option>Effism/2020/ESOL/Oper</option>
                      <option>Effism/2020/ESOL/EFFISM</option>
                      <option>Effism/2020/ESOL/IBC</option>
                      <option>AES/JN/2024/HYDRAULICS</option>
                      <option>AES/IN/2022/BIZEVENTS</option>
                      <option>ESOL/AIMRI/LMS1.0/24</option>
                      <option>ESOL/AMR/WEBS/24</option>
                      <option>AES/JN/2024/EIT</option>
                      <option>ESOL/AIMRIIN/WEBS/25</option>
                      <option>ESOL/ONE/AM/WBS/25</option>
                      <option>ESOL/AIMRI/EFSM 2.0/23</option>
                      <option>AES/JN/2024/YACHTEK</option>
                      <option>AES/JN/2022/AIMRIIND</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Client</label>
                    <input
                      type="text"
                      value={row.client || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "client", e.target.value)
                      }
                    />
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label>Est Time</label>
                      <select
                        value={row.est || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "est", e.target.value)
                        }
                      >
                        <option value="">Select...</option>
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Rate</label>
                      <input
                        type="text"
                        value={row.rate ? `₹${row.rate}` : "—"}
                        disabled
                        className="rate-field"
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label>Act Time</label>
                      <select
                        value={row.act || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "act", e.target.value)
                        }
                      >
                        <option value="">Select...</option>
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Status %</label>
                      <select
                        value={row.status || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "status", e.target.value)
                        }
                      >
                        <option value="">Select...</option>
                        {[
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
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}%
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label>Target Date</label>
                      <input
                        type="date"
                        value={row.target || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "target", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-group">
                      <label>CF Date</label>
                      <input
                        type="date"
                        value={row.cfDate || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "cfDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Total Est</label>
                    <select
                      value={row.totalEst || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "totalEst", e.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Outcome</label>
                    <textarea
                      value={row.outcome || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "outcome", e.target.value)
                      }
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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

        <div
          ref={containerRef}
          className="handsontable-container desktop-only"
        ></div>
        <div className="mobile-only">
          <MobileAccordion />
        </div>
      </div>
    </div>
  );
};

export default App;
