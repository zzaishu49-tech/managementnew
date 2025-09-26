// import React, { useState } from 'react';
// import { Project } from '../../types';
// import { useData } from '../../context/DataContext';
// import { useAuth } from '../../context/AuthContext';
// import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
// import { CommentSection } from '../Comments/CommentSection';
// import { FileManager } from '../Files/FileManager';

// interface StageDetailProps {
//   project: Project;
//   onBack: () => void; 
// }

// export function StageDetail({ project, onBack }: StageDetailProps) {
//   const { user } = useAuth(); 
//   const { stages, updateStageProgress } = useData();
//   const [selectedStage, setSelectedStage] = useState<string>('');

//   const projectStages = stages.filter(stage => stage.project_id === project.id)
//                             .sort((a, b) => a.order - b.order);

//   const currentStage = selectedStage 
//     ? projectStages.find(s => s.id === selectedStage) 
//     : projectStages[0];

//   if (!currentStage) {
//     return (
//       <div className="p-6">
//         <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Projects
//         </button>
//         <div className="text-center py-12">
//           <p className="text-gray-600">No stages found for this project</p>
//         </div>
//       </div>
//     );
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case 'rejected': return <AlertTriangle className="w-5 h-5 text-red-500" />;
//       default: return <Clock className="w-5 h-5 text-orange-500" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'approved': return 'bg-green-100 text-green-800';
//       case 'rejected': return 'bg-red-100 text-red-800';
//       default: return 'bg-orange-100 text-orange-800';
//     }
//   };

//   const handleProgressUpdate = (progress: number) => {
//     updateStageProgress(currentStage.id, progress);
//   };

//   return (
//     <div className="p-6">
//       <button
//         onClick={onBack}
//         className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
//       >
//         <ArrowLeft className="w-4 h-4 mr-2" />
//         Back to Projects
//       </button>

//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
//         <p className="text-gray-600">{project.description}</p>
//       </div>

//       {/* Stage Navigation */}
//       <div className="mb-6">
//         <div className="flex flex-wrap gap-2">
//           {projectStages.map(stage => (
//             <button
//               key={stage.id}
//               onClick={() => setSelectedStage(stage.id)}
//               className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
//                 selectedStage === stage.id || (!selectedStage && stage === currentStage)
//                   ? 'bg-green-600 text-white border-green-600'
//                   : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
//               }`}
//             >
//               {getStatusIcon(stage.approval_status)}
//               <span className="text-sm font-medium">{stage.name}</span>
//               <span className="text-xs bg-black bg-opacity-20 px-2 py-1 rounded">
//                 {stage.progress_percentage}%
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Stage Info & Progress */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">{currentStage.name}</h3>
//             <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStage.approval_status)}`}>
//               {currentStage.approval_status}
//             </span>
//           </div>

//           {currentStage.notes && (
//             <p className="text-gray-600 mb-4">{currentStage.notes}</p>
//           )}

//           {user?.role === 'employee' && (
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Update Progress ({currentStage.progress_percentage}%)
//               </label>
//               <input
//                 type="range"
//                 min="0"
//                 max="100"
//                 value={currentStage.progress_percentage}
//                 onChange={(e) => handleProgressUpdate(parseInt(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
//               />
//               <div className="flex justify-between text-xs text-gray-500 mt-1">
//                 <span>0%</span>
//                 <span>50%</span>
//                 <span>100%</span>
//               </div>
//             </div>
//           )}

//           <div className="w-full bg-gray-200 rounded-full h-3">
//             <div
//               className="h-3 bg-green-600 rounded-full transition-all duration-300"
//               style={{ width: `${currentStage.progress_percentage}%` }}
//             />
//           </div>
//         </div>

//         {/* File Management */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <FileManager
//             stageId={currentStage.id}
//             canUpload={user?.role !== 'client' || currentStage.approval_status === 'pending'}
//           />
//         </div>
//       </div>

//       {/* Comments Section */}
//       <div className="mt-6">
//         <CommentSection stageId={currentStage.id} />
//       </div>
//     </div>
//   );
// } 