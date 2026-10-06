# Initial datacenter design

## Purpose and baseline

This is an initial concept for a shared university AI datacenter in France, using Paris-Saclay as the screening location. The baseline assumes 20 MW of IT load, PUE 1.25, 25 MW total facility load and 219 GWh of annual electricity at continuous full load.

## Power system

Grid supply enters independent A and B distribution paths, each serving UPS-backed IT loads. Backup generators support critical IT, cooling controls and network equipment after utility loss. The largest distribution component may fail while the remaining path carries protected load; non-critical training jobs may be shed.

## Cooling and heat

The concept uses direct-to-chip liquid cooling with an indoor water loop and outdoor dry heat rejection. This reduces routine water dependence and creates a possible heat-reuse interface. Final temperatures, redundancy, water treatment and seasonal performance require vendor curves and site studies.

## Network and operations

Two physically diverse carriers connect to separate building entrances. A high-speed cluster fabric links compute and storage, with a separate management path and an external backup copy. Capacity is allocated through member commitments, with a shared pool for unused reservations.

## Decision boundary

The current recommendation is to lease compute while the consortium verifies demand, grid connection, site control and supplier bids. Construction should proceed only after members sign capacity commitments and site-specific technical unknowns are resolved. This concept is not a professional engineering certification or construction-ready design.
