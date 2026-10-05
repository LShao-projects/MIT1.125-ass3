import Workspace from '../workspace';
import {notFound} from 'next/navigation';
export default async function Page({params}:{params:Promise<{view:string}>}){const {view}=await params;if(!['explore','compare','design','economics','summary','evidence','adviser'].includes(view))notFound();return <Workspace initialView={view}/>}
