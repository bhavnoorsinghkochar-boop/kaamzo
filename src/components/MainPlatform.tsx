import React from "react";
import { useApp } from "../context/AppContext";
import { RoleSelectScreen } from "./RoleSelectScreen";
import { WorkerApp } from "./worker/WorkerApp";
import { CustomerApp } from "./customer/CustomerApp";
import { AdminDashboard } from "./admin/AdminDashboard";
export const MainPlatform: React.FC = () => {
  const { currentRole } = useApp();
  /* If at selection stage: show the 3 role choices (Worker, Customer, Admin) */ if (
    currentRole === "select_role"
  ) {
    return (
      <div className="w-full flex-1 flex items-center justify-center p-3 sm:p-6">
        {" "}
        <RoleSelectScreen />{" "}
      </div>
    );
  }
  /* If Worker chosen: Customer and Admin completely disappear */ if (
    currentRole === "worker"
  ) {
    return (
      <div className="w-full flex-1 flex justify-center items-start p-0 sm:p-5 lg:p-6">
        <div className="w-full max-w-7xl">
          <WorkerApp isEmbedded={false} />
        </div>
      </div>
    );
  }
  /* If Customer / Employer chosen: Worker and Admin completely disappear */ if (
    currentRole === "customer"
  ) {
    return (
      <div className="w-full flex-1 flex justify-center items-start p-0 sm:p-5 lg:p-6">
        <div className="w-full max-w-7xl">
          <CustomerApp isEmbedded={false} />
        </div>
      </div>
    );
  }
  /* If Admin chosen: Worker and Customer completely disappear */ if (
    currentRole === "admin"
  ) {
    return (
      <div className="w-full flex-1 flex justify-center items-start p-2 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          <AdminDashboard isEmbedded={false} />
        </div>
      </div>
    );
  }
  return (
    <div className="w-full flex-1 flex items-center justify-center p-3 sm:p-6">
      {" "}
      <RoleSelectScreen />{" "}
    </div>
  );
};
