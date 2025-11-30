# PSM Manufacturing ERP System - Scope of Work

**Project:** Initial Visibility ERP Replacement for PSM Manufacturing
**Current Status:** Foundation Complete - Manufacturing Tracking & Analytics
**Document Date:** November 30, 2025

---

## Executive Summary

This document outlines the path to replace Visibility ERP with a modern cloud-based system for PSM manufacturing operations. The current system provides foundational manufacturing tracking, cost accounting, and executive analytics. The roadmap defines the critical features needed for initial deployment.

---

## Current System Capabilities

**Manufacturing Operations:**
- Multi-stage production tracking (Coating → Adhesive → Liner → Cutting)
- Bill of Materials (BOM) management with multi-level support
- Three order types: Purchase Orders, Production Orders, Fulfillment Orders
- Automatic cost calculation with material and labor rollup through production stages
- MSI-based measurement system with width-aware calculations
- Product classification: Raw materials, Work-in-Progress (WIP), Finished Goods
- R&D cost tracking with 2x labor multiplier

**Analytics & Reporting:**
- Executive Dashboard: Production costs, inventory valuation, order trends
- Inventory Dashboard: Stock levels, product movement, high-value items, alerts
- Production Dashboard: Production vs R&D metrics, efficiency tracking, cost breakdown
- Real-time cost accounting with automatic cost-per-unit updates

**System Features:**
- Role-based access control (Operator, Manager, Admin)
- Session-based authentication with permission controls
- Modern tech stack: TypeScript, React 18, Express, Recharts
- Cloud-deployed on Vercel with API-first architecture

---

## Roadmap to Initial Visibility Replacement

### Phase 1: Multi-Location Inventory (CRITICAL)
**Add:** Warehouse/location management, bin locations, inter-location transfers, location-specific stock levels, transfer orders and tracking

### Phase 2: Enhanced Production Scheduling
**Add:** Work order scheduling calendar, machine assignment, capacity planning, production queue management, bottleneck identification

### Phase 3: Customer & Sales Management
**Add:** Customer database, sales order entry, pricing rules, order fulfillment workflow, shipping integration (UPS/FedEx), customer order portal

### Phase 4: Vendor & Purchasing
**Add:** Vendor database, purchase requisitions, automated reorder points, receiving inspection, vendor performance tracking

### Phase 5: Quality Control
**Add:** In-process quality checkpoints, Certificate of Analysis (COA) generation, non-conformance tracking, scrap/rework recording

### Phase 6: Core Infrastructure
**Add:** PostgreSQL database migration, automated backups, barcode scanning, label printing, audit logging, enhanced security

---

## Success Metrics

**Operational Impact:**
- 50% reduction in order processing time
- 30% reduction in inventory carrying costs
- 25% improvement in on-time delivery

**Financial Visibility:**
- Real-time cost tracking across all production stages (✓ achieved)
- Accurate job costing for customer quotes
- 20% reduction in month-end close time

**User Adoption:**
- Single system replacing Visibility ERP and spreadsheets
- Modern dashboards accessible from shop floor and executive offices
- Reduced training time through intuitive UI

---

## Business Value

The current system demonstrates production-ready manufacturing tracking with cost accounting and analytics that exceed Visibility's capabilities. The six-phase roadmap focuses on essential features for initial deployment:

1. **Multi-location support** enables accurate tracking across warehouse zones
2. **Production scheduling** optimizes machine utilization and delivery commitments
3. **Customer/vendor management** streamlines order processing and purchasing
4. **Quality controls** ensure compliance and reduce defects
5. **Infrastructure upgrades** provide enterprise-grade reliability and scalability

This focused approach delivers a working Visibility replacement while establishing the foundation for future enhancements like EDI integration, advanced analytics, and formula management.
