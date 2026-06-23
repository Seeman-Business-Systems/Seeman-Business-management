# Seeman Auto & Agro Industries — Business Management System

A full-stack, ERP-style business management system built as a Final Year Project for BSc (Hons) Software Engineering at the University of Portsmouth. Developed for a real client: Seeman Auto & Agro Industries, a family-run automotive parts distributor operating across four branches in Nigeria.

The project was awarded **88% — the highest mark in the cohort**.

---

## The Problem

The business had previously attempted a digital system, but it was abandoned when the only two people who understood it left the organisation. Stock was tracked through memory and verbal communication, sales were recorded in notebooks, and the business owner relied on daily phone calls across branches to understand performance.

The core challenge was not just technical. A failed previous attempt meant that staff trust in digital tooling was low, and capability was concentrated in too few people. The solution had to be genuinely usable by everyone in the organisation, from branch managers to apprentices, or it would face the same fate.

---

## The Approach

Before writing any code, stakeholder interviews were conducted with the owner, branch managers, sales staff, and apprentices to map existing workflows and identify barriers to adoption. The COM-B behaviour change model was applied to diagnose why the previous system failed, and the findings were translated directly into system requirements.

Key design decisions that followed from this:

- Granular, role-based access control to distribute responsibility across all staff levels rather than concentrating it in a few users

- Activity logging framed as operational visibility rather than surveillance, giving staff transparency into how the system was being used

- Real-time dashboards so staff could immediately see the value of their own digital entries, making the benefit of using the system visible from day one

- Stock updates and sales activity propagating across all four branches in real time, eliminating the need for daily phone calls

---

## Features

- Authentication and role-based access control across multiple user roles

- Multi-branch inventory management with real-time stock visibility

- Sales recording with separate supply fulfilment tracking

- Expense logging

- Reporting and branch performance dashboards

- Event-driven activity logging for operational transparency

---

## Tech Stack

| Layer | Technology |

|---|---|

| Frontend | React, TypeScript |

| Backend | NestJS (Node.js) |

| Database | PostgreSQL |

| ORM | TypeORM |

| Deployment | Render |

---

## Delivery

The system was delivered across five increments with regular client feedback sessions, following an Agile approach. Each increment was reviewed against the original requirements and adjusted based on feedback before the next phase began.

---

## Deployment

The system is live and deployed on Render:

**https://seemanauto.onrender.com/login**

> **Please note:** the system is restricted to internal users of Seeman Auto & Agro Industries and is not open for public access. Login credentials are not available to external visitors. The deployment link is provided to demonstrate that the system is production-ready and live rather than a prototype or mock-up.

User acceptance testing was conducted with staff across all roles at all four branches, confirming that users could complete their core workflows. This validated that the system addressed the adoption barriers that caused the previous attempt to fail.

---

## Author

Paschal Ezenwobi

BSc (Hons) Software Engineering, University of Portsmouth (2026)

[GitHub](https://github.com/) | [LinkedIn](https://linkedin.com/)
