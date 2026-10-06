'use client';
import {useState,type ReactNode} from 'react';
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from '@/components/ui/tooltip';

export default function MetricHelp({title,children}:{title:string;children:ReactNode}){
 const [open,setOpen]=useState(false);
 return <TooltipProvider delayDuration={180}><Tooltip open={open} onOpenChange={setOpen}><TooltipTrigger asChild><button type="button" className="metric-help-button" aria-label={`How to read ${title}`} onClick={e=>{e.preventDefault();setOpen(true)}}>?</button></TooltipTrigger><TooltipContent className="metric-help-content" side="bottom" align="end" sideOffset={8} collisionPadding={14}><strong>{title}</strong>{children}</TooltipContent></Tooltip></TooltipProvider>;
}
export function CostDefinitions(){return <>
 <p><b>Cash before opening:</b> cumulative net cash out before the owned facility opens. Base/half: year-0 facility, grid and GPU capital. Grid delay: year 0 plus year 1, including deferred GPUs, bridge leasing, site costs and financing; owned operation starts in year 2. Pure leasing has no owned-facility opening investment.</p>
 <p><b>Year 1 operating cost:</b> electricity + facility fixed costs + GPU maintenance + permanent and temporary leases. Capital purchases and financing are excluded.</p>
 <p><b>Cost / productive GPU-hour:</b> ten-year net cost (capital + operations + financing − terminal recovery) ÷ total productive GPU-hours over those ten years. Constant-price model; no discounting.</p>
 <p><b>Capital at risk:</b> initial facility and GPU capital less modeled recovery, plus one year of minimum permanent lease commitments and temporary grid-delay leasing. This estimates exposure without weighting losses by probability.</p>
 </>}
