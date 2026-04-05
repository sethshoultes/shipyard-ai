# PRD-003: EmDash Plugin Suite — MemberShip + EventDash

> **Status**: DEBATE
> **Created**: 2026-04-05
> **Pipeline**: Full Great Minds process

## Overview
Build production-quality EmDash plugins that are the first in the marketplace.
MemberShip v0.1 and EventDash v0.1 exist as drafts. This PRD runs them through
the full pipeline: debate, plan, build (improvements), review, ship.

## Products

### MemberShip v1.0
- Membership plans with Stripe integration (not just KV storage)
- Content gating with granular access levels
- Member dashboard page
- Welcome email via Resend on registration
- Admin: member management, revenue dashboard

### EventDash v1.0
- Event CRUD with rich Portable Text descriptions
- Calendar view component (month/week/list)
- Registration with email confirmation
- Stripe checkout for paid events
- iCal export
- Admin: event management, attendee lists, check-in

## Quality Bar
- TypeScript strict, zero any
- Unit tests for all API routes
- Admin UI via Block Kit
- README with installation + usage docs
- Tested on a live EmDash site (Sunrise Yoga for EventDash, Bella's for MemberShip)
