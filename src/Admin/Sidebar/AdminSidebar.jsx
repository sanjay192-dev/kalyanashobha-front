import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Heart, LogOut, CheckCircle, 
  Briefcase, Store, Award, Layers, HelpCircle, Target, FileCheck, 
  FileEdit, MessageSquare, UserPlus // <-- NEW: Imported UserPlus icon
} from "lucide-react";
import axios from "axios";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [stats, setStats] = useState({ 
    pendingReg: 0,
    newRequests: 0,      
    acceptedMatches: 0,  
    pendingData: 0       
  });

  // Get the admin info to check role and permissions
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('adminInfo'));
    if (info) setAdminInfo(info);
  }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const headers = { Authorization: token };
      
      // UPDATED: Now using http://localhost:5000
      const [statsRes, phase1Res, phase2Res, pendingDataRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats", { headers }),
        axios.get("http://localhost:5000/api/admin/interest/workflow?status=PendingAdminPhase1", { headers }),
        axios.get("http://localhost:5000/api/admin/interest/workflow?status=PendingAdminPhase2", { headers }),
        axios.get("http://localhost:5000/api/admin/pending-data", { headers }) 
      ]);
      
      setStats({
        pendingReg: statsRes.data.success ? statsRes.data.stats.actionQueue.pendingRegistrationPayments : 0,
        newRequests: phase1Res.data.success ? phase1Res.data.data.length : 0,
        acceptedMatches: phase2Res.data.success ? phase2Res.data.data.length : 0,
        pendingData: pendingDataRes.data.success ? pendingDataRes.data.data.length : 0, 
      });

    } catch (e) {
      console.error("Failed to fetch sidebar stats", e);
    }
  };

  useEffect(() => {
    fetchCounts();
    window.addEventListener("paymentUpdated", fetchCounts);
    window.addEventListener("interestUpdated", fetchCounts);
    
    return () => {
        window.removeEventListener("paymentUpdated", fetchCounts);
        window.removeEventListener("interestUpdated", fetchCounts);
    }
  }, [location.pathname]); 

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const totalPendingInterests = stats.newRequests + stats.acceptedMatches;

  // 1. Define all available sidebar links
  const allLinks = [
    { id: "dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { id: "users", path: "/admin/users", icon: <Users size={20} />, label: "User Registry" },
    { 
      id: "reg-approvals", 
      path: "/admin/registration-approvals", 
      icon: <CheckCircle size={20} />, 
      label: "Reg. Approvals", 
      badge: stats.pendingReg 
    },
    { 
      id: "interest-approvals", 
      path: "/admin/interest-approvals", 
      icon: <Heart size={20} />, 
      label: "Interest Approvals", 
      badge: totalPendingInterests 
    },
    { id: "agents", path: "/admin/agents", icon: <Briefcase size={20} />, label: "Agents" },
    { id: "vendors", path: "/admin/vendors", icon: <Store size={20} />, label: "Vendors" },
    { id: "user-certificates", path: "/admin/user-certificates", icon: <Award size={20} />, label: "User Acceptance" },
    { id: "add-data", path: "/admin/add-fields", icon: <Layers size={20} />, label: "Add Data" },
    { id: "vendor-leads", path: "/admin/vendor-leads", icon: <Target size={20} />, label: "Vendor Leads" },
    { id: "help-center", path: "/admin/help-center", icon: <HelpCircle size={20} />, label: "Help Center" },
    { 
      id: "data-approval", 
      path: "/admin/data-approval", 
      icon: <FileCheck size={20} />, 
      label: "Data Approval",
      badge: stats.pendingData 
    },
    { id: "manage-pages", path: "/admin/page-content", icon: <FileEdit size={20} />, label: "Manage Pages" },
    { id: "testimonials", path: "/admin/add-testimonial", icon: <MessageSquare size={20} />, label: "Testimonials" },
    
    // NEW: Added the Create Moderator link here
    { id: "create-moderator", path: "/admin/moderater", icon: <UserPlus size={20} />, label: "Create Moderator" }
  ];

  // 2. Filter links based on role & permissions
  const filteredLinks = allLinks.filter(link => {
    if (!adminInfo) return false;
    // SuperAdmin sees everything
    if (adminInfo.role === 'SuperAdmin') return true;
    // Moderator only sees what is in their permissions array
    return adminInfo.permissions?.includes(link.id);
  });

  return (
    <aside className="ks-sidebar-container">
      <div className="ks-sidebar-header">
        <h2 className="ks-sidebar-title">KalyanaShobha</h2>
        <span className="ks-sidebar-subtitle">Admin Portal</span>
      </div>

      <nav className="ks-sidebar-nav">
        <ul>
          {/* 3. Map through the filtered links to render them */}
          {filteredLinks.map((link) => (
            <li key={link.id}>
              <NavLink to={link.path} className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  {link.icon}
                  {link.badge > 0 && (
                    <span className="ks-notification-badge">{link.badge}</span>
                  )}
                </div>
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ks-sidebar-footer">
        <button onClick={handleLogout} className="ks-logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
