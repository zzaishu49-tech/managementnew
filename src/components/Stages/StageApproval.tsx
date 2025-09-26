// import React from 'react';
// import { CheckCircle, XCircle, Clock } from 'lucide-react';

// interface Stage {
//   id: string;
//   name: string;
//   status: 'pending' | 'approved' | 'rejected' | 'in-progress';
//   description?: string;
//   dueDate?: string;
// }

// interface StageApprovalProps {
//   stage: Stage;
//   onApprove?: (stageId: string) => void;
//   onReject?: (stageId: string) => void;
// }

// export const StageApproval: React.FC<StageApprovalProps> = ({ 
//   stage, 
//   onApprove, 
//   onReject 
// }) => {
//   const getStatusIcon = () => {
//     switch (stage.status) {
//       case 'approved':
//         return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case 'rejected':
//         return <XCircle className="w-5 h-5 text-red-500" />;
//       case 'in-progress':
//         return <Clock className="w-5 h-5 text-blue-500" />;
//       default:
//         return <Clock className="w-5 h-5 text-gray-400" />;
//     }
//   };

//   const getStatusColor = () => {
//     switch (stage.status) {
//       case 'approved':
//         return 'bg-green-50 border-green-200';
//       case 'rejected':
//         return 'bg-red-50 border-red-200';
//       case 'in-progress':
//         return 'bg-blue-50 border-blue-200';
//       default:
//         return 'bg-gray-50 border-gray-200';
//     }
//   };

//   return (
//     <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2">
//           {getStatusIcon()}
//           <h3 className="font-semibold text-gray-900">{stage.name}</h3>
//         </div>
//         <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
//           stage.status === 'approved' ? 'bg-green-100 text-green-800' :
//           stage.status === 'rejected' ? 'bg-red-100 text-red-800' :
//           stage.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
//           'bg-gray-100 text-gray-800'
//         }`}>
//           {stage.status}
//         </span>
//       </div>
      
//       {stage.description && (
//         <p className="text-gray-600 text-sm mb-3">{stage.description}</p>
//       )}
      
//       {stage.dueDate && (
//         <p className="text-gray-500 text-xs mb-3">Due: {stage.dueDate}</p>
//       )}
      
//       {stage.status === 'pending' && (onApprove || onReject) && (
//         <div className="flex gap-2">
//           {onApprove && (
//             <button
//               onClick={() => onApprove(stage.id)}
//               className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
//             >
//               <CheckCircle className="w-4 h-4" />
//               Approve
//             </button>
//           )}
//           {onReject && (
//             <button
//               onClick={() => onReject(stage.id)}
//               className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
//             >
//               <XCircle className="w-4 h-4" />
//               Reject
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }; 