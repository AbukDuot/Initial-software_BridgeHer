import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function DashboardCard({ title, value, icon }: DashboardCardProps) {
  return (
    <div className="card dashboard-card">
      <div className="dash-header">
        <span>{icon}</span>
        <h4>{title}</h4>
      </div>
      <p>{value}</p>
    </div>
  );
}

module.exports = DashboardCard;