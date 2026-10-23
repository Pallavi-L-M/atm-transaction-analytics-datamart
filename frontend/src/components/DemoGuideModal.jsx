import React from 'react';
import { X, Play, CheckCircle2, ChevronRight, Award, Compass, Layers, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function DemoGuideModal({ isOpen, onClose, setActivePage }) {
  const {
    demoCurrentStep,
    setDemoCurrentStep,
    datasetMeta,
    setSearchQuery,
    setSelectedCity,
    resetFilters
  } = useData();

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: "1. Open the Overview Dashboard",
      page: "overview",
      badge: "Executive View",
      summary: "Show overall ATM network metrics, reported income, cash outflow, and activity patterns.",
      talkingPoint: "State the objective of the Data Mart: aggregating transactional summaries into actionable star schema metrics without double counting.",
      actionLabel: "Go to Overview",
      action: () => {
        resetFilters();
        setActivePage('overview');
      }
    },
    {
      step: 2,
      title: "2. Show Imported Dataset & Record Count",
      page: "data-management",
      badge: "Data Ingestion",
      summary: `Highlight the dataset source (${datasetMeta.fileName}) containing ${datasetMeta.rowCount.toLocaleString()} summary records and validate the 12 schema columns.`,
      talkingPoint: "Explain that each row represents an ATM transaction summary snapshot with 'day' and 'transactionTime'.",
      actionLabel: "View Data Management",
      action: () => {
        setActivePage('data-management');
      }
    },
    {
      step: 3,
      title: "3. Search for a Specific ATM",
      page: "atm-explorer",
      badge: "ATM Explorer",
      summary: "Demonstrate fast search by ATM text ID (e.g. 'atm350000') or location name.",
      talkingPoint: "Show how selecting an ATM opens the side drawer with granular day-of-week analytics and reported balances.",
      actionLabel: "Search 'atm350000'",
      action: () => {
        resetFilters();
        setSearchQuery('atm350000');
        setActivePage('atm-explorer');
      }
    },
    {
      step: 4,
      title: "4. Filter Data by City",
      page: "atm-explorer",
      badge: "Dimension Filtering",
      summary: "Apply the 'Chicago' or 'New York' geographic filter to observe dynamic slicing across all widgets.",
      talkingPoint: "Emphasize star schema dimension filtering (dim_location) across fact_atm_summary.",
      actionLabel: "Filter by Chicago",
      action: () => {
        resetFilters();
        setSelectedCity('Chicago');
        setActivePage('atm-explorer');
      }
    },
    {
      step: 5,
      title: "5. Compare Income and Outcome",
      page: "analytics",
      badge: "Financial Analysis",
      summary: "Open Transaction Analytics to examine side-by-side cash inflows (deposits) vs outflows (withdrawals) by city.",
      talkingPoint: "Explain bank liquidity balancing: ATMs in commercial zones usually experience higher withdrawals than deposits.",
      actionLabel: "Open Transaction Analytics",
      action: () => {
        resetFilters();
        setActivePage('analytics');
      }
    },
    {
      step: 6,
      title: "6. Display Top 10 ATMs by Income",
      page: "analytics",
      badge: "Performance Ranking",
      summary: "Rank top income-generating ATMs and evaluate their transaction counts.",
      talkingPoint: "Discuss how bank executives use this ranking for cash replenishment prioritization and branch expansion.",
      actionLabel: "View Top 10 Rankings",
      action: () => {
        resetFilters();
        setActivePage('analytics');
      }
    },
    {
      step: 7,
      title: "7. Export and Print Analytics Report",
      page: "reports",
      badge: "Executive Reporting",
      summary: "Generate an audit-ready printable report and export filtered summaries to CSV.",
      talkingPoint: "Demonstrate that the Data Mart provides clean exportable BI deliverables with timestamp and applied filter audit trails.",
      actionLabel: "Generate Final Report",
      action: () => {
        setActivePage('reports');
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">College Project Demo Workflow</h3>
              <p className="text-xs text-slate-400">
                Interactive step-by-step presentation walkthrough for professors & evaluators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Steps List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 flex items-start space-x-3">
            <Compass className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Demonstration Strategy:</span> Click <strong>"Execute Step"</strong> on any card to automatically navigate to the required page, set relevant filters, and show key metrics. Use the provided <em>Talking Points</em> to impress your evaluator!
            </div>
          </div>

          <div className="space-y-3">
            {demoSteps.map((step) => {
              const isActive = demoCurrentStep === step.step;
              return (
                <div
                  key={step.step}
                  className={`border rounded-xl p-4 transition-all duration-200 ${
                    isActive
                      ? 'border-blue-500 bg-blue-50/20 shadow-sm ring-1 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {step.step}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                            {step.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{step.summary}</p>
                        
                        <div className="mt-2.5 bg-amber-50/80 border border-amber-200/60 rounded-lg p-2.5 text-xs text-amber-900">
                          <strong className="text-amber-800">💡 College Viva / Talking Point:</strong> {step.talkingPoint}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setDemoCurrentStep(step.step);
                        step.action();
                        onClose();
                      }}
                      className="ml-4 shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-white" />
                      {step.actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Project: <span className="font-semibold text-slate-800">ATM Transaction Analytics Data Mart</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
