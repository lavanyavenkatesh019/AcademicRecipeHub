import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authUtils";
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../utils/apiConfig";

const Reports = ({ onDeletePrompt }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/Reports`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus, action = "None") => {
    try {
      const response = await authFetch(`${API_BASE_URL}/Reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          adminAction: action
        }),
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  const handleDeleteReport = (id) => {
    onDeletePrompt({
      title: "Dismiss Report",
      message: "Are you sure you want to permanently dismiss this report? This will remove it from the moderation queue.",
      onConfirm: async () => {
        try {
          const response = await authFetch(`${API_BASE_URL}/Reports/${id}`, {
            method: "DELETE"
          });

          if (response.ok) {
            setReports(prev => prev.filter(r => r.id !== id));
          } else {
            toast.error("Failed to delete report.");
          }
        } catch (error) {
          console.error("Error deleting report:", error);
        }
      }
    });
  };

  const filteredReports = reports.filter(r => r.status === activeTab);
  const counts = {
    Pending: reports.filter(r => r.status === "Pending").length,
    Resolved: reports.filter(r => r.status === "Resolved").length,
    Archived: reports.filter(r => r.status === "Archived").length
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Content Moderation</h2>
        <div className="flex bg-gray-200 p-1 rounded-xl">
          {["Pending", "Resolved", "Archived"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === tab ? "bg-white text-orange-600 shadow-md" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-white">
        <div className="bg-orange-600 rounded-3xl shadow-xl p-8 border border-orange-100/20">
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Pending Reports</p>
          <h3 className="text-4xl font-black mt-2 tracking-tight">{counts.Pending}</h3>
          <p className="text-white/60 text-xs mt-1 font-medium">Awaiting moderation</p>
        </div>

        <div className="bg-orange-600 rounded-3xl shadow-xl p-8 border border-orange-100/20">
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Resolved Reports</p>
          <h3 className="text-4xl font-black mt-2 tracking-tight">{counts.Resolved}</h3>
          <p className="text-white/60 text-xs mt-1 font-medium">Actions taken</p>
        </div>

        <div className="bg-orange-600 rounded-3xl shadow-xl p-8 border border-orange-100/20">
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Total Reports</p>
          <h3 className="text-4xl font-black mt-2 tracking-tight">{reports.length}</h3>
          <p className="text-white/60 text-xs mt-1 font-medium">Across all categories</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-20 text-center text-gray-500 font-bold text-xl uppercase tracking-widest">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-24 text-center text-gray-500 font-bold text-xl">No Pending reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-5">Recipe / Reporter</th>
                  <th className="px-8 py-5">Reason & Description</th>
                  <th className="px-8 py-5 text-center">Status / Action</th>
                  <th className="px-8 py-5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-800 text-lg mb-1">{report.recipeTitle}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="opacity-60">Reported by</span> 
                        <span className="font-semibold text-orange-600">{report.reporterName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold mb-2">
                        {report.reason}
                      </div>
                      <p className="text-gray-600 text-sm italic leading-relaxed">
                        "{report.description || "No description provided."}"
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-2 ${
                        report.status === "Pending" ? "bg-red-50 text-red-500" : 
                        report.status === "Resolved" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                      }`}>
                        {report.status}
                      </div>
                      {report.adminAction !== "None" && (
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                           Action: {report.adminAction}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {report.status === "Pending" ? (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleUpdateStatus(report.id, "Resolved", "Edited")}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                          >
                            Edited
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(report.id, "Resolved", "Deleted")}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                          >
                            Deleted
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(report.id, "Resolved", "Ignored")}
                            className="px-3 py-1.5 rounded-lg bg-gray-500 text-white text-xs font-bold hover:bg-gray-600 transition-colors"
                          >
                            Ignore
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {report.status === "Resolved" && (
                            <button 
                              onClick={() => handleUpdateStatus(report.id, "Archived", report.adminAction)}
                              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors bg-white"
                            >
                              Archive
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteReport(report.id)}
                            className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors bg-white"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;