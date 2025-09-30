import React from "react";
import {
  FileText,
  Clipboard,
  Package,
  Truck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  useBindingAdvices,
  useJobCards,
  useInventoryItems,
  useDispatches,
  useInvoices,
  useClients,
} from "../hooks/useApiQueries";
import ApiStatusBanner from "../components/ApiStatusBanner";

const Dashboard = () => {
  // Use React Query hooks for data fetching
  const { data: bindingAdvices = [], isLoading: bindingLoading } =
    useBindingAdvices();
  const { data: jobCards = [], isLoading: jobCardsLoading } = useJobCards();
  const { data: inventory = [], isLoading: inventoryLoading } =
    useInventoryItems();
  const { data: dispatches = [], isLoading: dispatchesLoading } =
    useDispatches();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: clients = [], isLoading: clientsLoading } = useClients();

  // Loading state
  const isLoading =
    bindingLoading ||
    jobCardsLoading ||
    inventoryLoading ||
    dispatchesLoading ||
    invoicesLoading ||
    clientsLoading;

  // Calculate dynamic stats
  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.totalAmount || 0),
    0
  );
  const activeBindingAdvice = bindingAdvices.filter(
    (ba) => ba.status !== "rejected"
  ).length;
  const inProductionJobs = jobCards.filter(
    (jc) => jc.currentStage !== "completed"
  ).length;
  const lowStockItems = inventory.filter(
    (item) => item.status === "low" || item.status === "critical"
  ).length;
  const pendingDispatches = dispatches.filter(
    (d) => d.status === "scheduled" || d.status === "in_transit"
  ).length;
  const activeClients = clients.filter((c) => c.status === "active").length;

  const stats = [
    {
      title: "Active Binding Advice",
      value: activeBindingAdvice.toString(),
      icon: FileText,
      color: "bg-blue-500",
      change: "+5.2%",
    },
    {
      title: "In Production",
      value: inProductionJobs.toString(),
      icon: Clipboard,
      color: "bg-green-500",
      change: "+12%",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockItems.toString(),
      icon: Package,
      color: "bg-purple-500",
      change: "-2.4%",
    },
    {
      title: "Pending Dispatch",
      value: pendingDispatches.toString(),
      icon: Truck,
      color: "bg-orange-500",
      change: "+8.1%",
    },
    {
      title: "Total Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      icon: TrendingUp,
      color: "bg-emerald-500",
      change: "+15.3%",
    },
    {
      title: "Active Customers",
      value: activeClients.toString(),
      icon: Users,
      color: "bg-pink-500",
      change: "+3.7%",
    },
  ];

  // Generate recent activities from actual data
  const recentActivities = [
    ...bindingAdvices.slice(-2).map((ba, index) => ({
      id: `ba-${index}`,
      action: "New Binding Advice created",
      client: ba.clientName,
      time: "2 hours ago",
      type: "binding",
    })),
    ...jobCards.slice(-1).map((jc, index) => ({
      id: `jc-${index}`,
      action: "Job Card in progress",
      order: jc.id,
      time: "4 hours ago",
      type: "production",
    })),
    ...dispatches.slice(-1).map((d, index) => ({
      id: `d-${index}`,
      action: "Dispatch scheduled",
      location: d.deliveryLocation,
      time: "6 hours ago",
      type: "dispatch",
    })),
  ].slice(0, 4);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Status Banner */}
      <ApiStatusBanner />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Pipeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Production Pipeline
          </h2>
          <div className="space-y-4">
            {[
              {
                stage: "Binding Advice",
                count: bindingAdvices.length,
                color: "bg-blue-100 text-blue-800",
              },
              {
                stage: "Job Cards Created",
                count: jobCards.length,
                color: "bg-yellow-100 text-yellow-800",
              },
              {
                stage: "In Production",
                count: inProductionJobs,
                color: "bg-green-100 text-green-800",
              },
              {
                stage: "Quality Check",
                count: jobCards.filter(
                  (jc) => jc.currentStage === "quality_check"
                ).length,
                color: "bg-purple-100 text-purple-800",
              },
              {
                stage: "Ready for Dispatch",
                count: dispatches.filter((d) => d.status === "scheduled")
                  .length,
                color: "bg-orange-100 text-orange-800",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <span className="font-medium text-gray-700">{item.stage}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${item.color}`}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "binding"
                      ? "bg-blue-500"
                      : activity.type === "production"
                      ? "bg-green-500"
                      : activity.type === "dispatch"
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.client ||
                      activity.order ||
                      activity.location ||
                      activity.amount}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: "New Binding Advice",
              desc: "Create quotation",
              color: "bg-blue-500",
              href: "/binding-advice",
            },
            {
              title: "Create Job Card",
              desc: "Start production",
              color: "bg-green-500",
              href: "/job-cards",
            },
            {
              title: "Check Inventory",
              desc: "View stock levels",
              color: "bg-purple-500",
              href: "/inventory",
            },
            {
              title: "Schedule Dispatch",
              desc: "Plan delivery",
              color: "bg-orange-500",
              href: "/dispatch",
            },
          ].map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity`}
            >
              <h3 className="font-semibold">{action.title}</h3>
              <p className="text-sm opacity-90">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
