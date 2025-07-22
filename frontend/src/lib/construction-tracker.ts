/**
 * Simplified Construction Project Tracking System
 * Built on top of the secure database client
 */

import { secureDb } from './database-secure';

export interface ConstructionProject {
  id: string;
  name: string;
  description: string;
  clientId: string;
  managerId: string;
  status: 'planning' | 'design' | 'permits' | 'construction' | 'inspection' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    area: number; // in square meters
    zoning: string;
  };
  timeline: {
    plannedStart: string;
    plannedEnd: string;
    actualStart?: string;
    actualEnd?: string;
    milestones: ProjectMilestone[];
  };
  budget: {
    totalBudget: number;
    spentAmount: number;
    remainingBudget: number;
    categories: BudgetCategory[];
  };
  team: {
    projectManager: string;
    engineers: string[];
    contractors: string[];
    supervisors: string[];
    workers: WorkerAssignment[];
  };
  progress: {
    overallPercentage: number;
    phases: ConstructionPhase[];
    lastUpdated: string;
  };
  quality: {
    inspections: QualityInspection[];
    issues: QualityIssue[];
    certifications: Certification[];
  };
  safety: {
    incidents: SafetyIncident[];
    trainings: SafetyTraining[];
    equipmentChecks: EquipmentCheck[];
    complianceStatus: {
      permits: { total: number; approved: number; pending: number; expired: number };
      inspections: { scheduled: number; passed: number; failed: number; overdue: number };
      certifications: { active: number; expiring: number; expired: number };
      safetyScore: number;
      environmentalCompliance: boolean;
    };
  };
  resources: {
    materials: MaterialUsage[];
    equipment: EquipmentUsage[];
    inventory: InventoryItem[];
  };
  documents: {
    permits: Document[];
    drawings: Document[];
    contracts: Document[];
    reports: Document[];
  };
  iot: {
    sensors: IoTSensor[];
    weatherData: WeatherReading[];
    environmentalData: EnvironmentalReading[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dependencies: string[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  vendor?: string;
  purchaseDate?: string;
}

export interface WorkerAssignment {
  workerId: string;
  name: string;
  role: string;
  hourlyRate: number;
  hoursWorked: number;
  startDate: string;
  endDate?: string;
}

export interface ConstructionPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  tasks: ConstructionTask[];
}

export interface ConstructionTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  estimatedHours: number;
  actualHours?: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  dependencies: string[];
}

export interface QualityInspection {
  id: string;
  type: string;
  inspectorName: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  findings: InspectionFinding[];
  overallRating: number;
  notes: string;
}

export interface InspectionFinding {
  id: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  recommendation: string;
  status: 'open' | 'resolved' | 'deferred';
}

export interface QualityIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  resolution?: string;
  resolvedDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending-renewal';
  documentUrl?: string;
}

export interface SafetyIncident {
  id: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location: string;
  reportedBy: string;
  reportedDate: string;
  injuriesCount: number;
  rootCause?: string;
  correctiveActions: string[];
  status: 'reported' | 'investigating' | 'resolved';
}

export interface SafetyTraining {
  id: string;
  title: string;
  description: string;
  trainerId: string;
  attendees: string[];
  scheduledDate: string;
  completedDate?: string;
  duration: number; // in hours
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface EquipmentCheck {
  id: string;
  equipmentId: string;
  equipmentName: string;
  checkType: 'daily' | 'weekly' | 'monthly' | 'annual';
  checkedBy: string;
  checkDate: string;
  status: 'passed' | 'failed' | 'needs-maintenance';
  issues: string[];
  nextCheckDate: string;
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  category: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
  deliveryDate: string;
}

export interface EquipmentUsage {
  equipmentId: string;
  equipmentName: string;
  type: string;
  plannedHours: number;
  hoursUsed: number;
  hourlyRate: number;
  totalCost: number;
  operator: string;
  startDate: string;
  endDate?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitCost: number;
  location: string;
  lastUpdated: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  fileUrl: string;
  status: 'draft' | 'approved' | 'expired';
}

export interface IoTSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'air-quality' | 'noise' | 'vibration' | 'movement';
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastReading: {
    value: number;
    unit: string;
    timestamp: string;
  };
  batteryLevel: number;
}

export interface WeatherReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  conditions: string;
}

export interface EnvironmentalReading {
  timestamp: string;
  airQuality: number;
  noiseLevel: number;
  dustLevel: number;
  vibrationLevel: number;
}

export interface ProjectAlert {
  id: string;
  projectId: string;
  type: 'safety' | 'quality' | 'budget' | 'schedule' | 'weather' | 'equipment';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  conditions: string;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  location: string;
}

export class ConstructionTracker {
  // Helper method to map project status
  private mapProjectStatus(status: string): 'planning' | 'design' | 'permits' | 'construction' | 'inspection' | 'completed' | 'on-hold' {
    switch (status) {
      case 'in-progress': return 'construction';
      case 'planning': return 'planning';
      case 'completed': return 'completed';
      case 'on-hold': return 'on-hold';
      default: return 'planning';
    }
  }

  // Helper method to map construction status to base project status
  private mapToBaseStatus(status: 'planning' | 'design' | 'permits' | 'construction' | 'inspection' | 'completed' | 'on-hold'): 'planning' | 'completed' | 'in-progress' | 'on-hold' {
    switch (status) {
      case 'completed': return 'completed';
      case 'planning': return 'planning';
      case 'on-hold': return 'on-hold';
      case 'design':
      case 'permits':
      case 'construction':
      case 'inspection':
        return 'in-progress';
      default: return 'planning';
    }
  }

  // Project Management
  async getProjects(filters?: {
    status?: string;
    priority?: string;
    managerId?: string;
    clientId?: string;
  }): Promise<ConstructionProject[]> {
    try {
      const response = await secureDb.getProjects({ limit: 100, ...filters });
      if (response.success && response.data) {
        // Transform the data to match ConstructionProject interface
        return response.data.data.map(project => ({
          id: project.id,
          name: project.title, // Map title to name
          description: project.description,
          clientId: project.clientId || '',
          managerId: project.managerId || '',
          status: this.mapProjectStatus(project.status),
          priority: (project.priority as any) || 'medium',
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          // Add construction-specific fields with defaults
          location: {
            address: project.location || 'Unknown',
            coordinates: { lat: 0, lng: 0 },
            area: 0,
            zoning: 'Unknown'
          },
          timeline: {
            plannedStart: project.startDate || new Date().toISOString(),
            plannedEnd: project.endDate || '',
            milestones: []
          },
          budget: {
            totalBudget: project.budgetKes,
            spentAmount: 0,
            remainingBudget: project.budgetKes,
            categories: []
          },
          team: {
            projectManager: project.managerId || '',
            engineers: [],
            contractors: [],
            supervisors: [],
            workers: []
          },
          progress: {
            overallPercentage: project.completionPercentage,
            phases: [],
            lastUpdated: project.updatedAt
          },
          quality: {
            inspections: [],
            issues: [],
            certifications: []
          },
          safety: {
            incidents: [],
            trainings: [],
            equipmentChecks: [],
            complianceStatus: {
              permits: { total: 0, approved: 0, pending: 0, expired: 0 },
              inspections: { scheduled: 0, passed: 0, failed: 0, overdue: 0 },
              certifications: { active: 0, expiring: 0, expired: 0 },
              safetyScore: 100,
              environmentalCompliance: true
            }
          },
          resources: {
            materials: [],
            equipment: [],
            inventory: []
          },
          documents: {
            permits: [],
            drawings: [],
            contracts: [],
            reports: []
          },
          iot: {
            sensors: [],
            weatherData: [],
            environmentalData: []
          }
        } as ConstructionProject));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch construction projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<ConstructionProject | null> {
    try {
      const response = await secureDb.getProject(id);
      if (response.success && response.data) {
        const project = response.data;
        // Transform to ConstructionProject format
        return {
          id: project.id,
          name: project.title, // Map title to name
          description: project.description,
          clientId: project.clientId || '',
          managerId: project.managerId || '',
          status: this.mapProjectStatus(project.status),
          priority: (project.priority as any) || 'medium',
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          location: {
            address: project.location || 'Unknown',
            coordinates: { lat: 0, lng: 0 },
            area: 0,
            zoning: 'Unknown'
          },
          timeline: {
            plannedStart: project.startDate,
            plannedEnd: project.endDate || '',
            milestones: []
          },
          budget: {
            totalBudget: project.budgetKes,
            spentAmount: 0,
            remainingBudget: project.budgetKes,
            categories: []
          },
          team: {
            projectManager: project.managerId || '',
            engineers: [],
            contractors: [],
            supervisors: [],
            workers: []
          },
          progress: {
            overallPercentage: project.completionPercentage,
            phases: [],
            lastUpdated: project.updatedAt
          },
          quality: {
            inspections: [],
            issues: [],
            certifications: []
          },
          safety: {
            incidents: [],
            trainings: [],
            equipmentChecks: [],
            complianceStatus: {
              permits: { total: 0, approved: 0, pending: 0, expired: 0 },
              inspections: { scheduled: 0, passed: 0, failed: 0, overdue: 0 },
              certifications: { active: 0, expiring: 0, expired: 0 },
              safetyScore: 100,
              environmentalCompliance: true
            }
          },
          resources: {
            materials: [],
            equipment: [],
            inventory: []
          },
          documents: {
            permits: [],
            drawings: [],
            contracts: [],
            reports: []
          },
          iot: {
            sensors: [],
            weatherData: [],
            environmentalData: []
          }
        } as ConstructionProject;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch construction project:', error);
      return null;
    }
  }

  async createProject(project: Omit<ConstructionProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConstructionProject | null> {
    try {
      // Transform ConstructionProject to base Project format for creation
      const baseProject = {
        title: project.name,
        description: project.description,
        status: this.mapToBaseStatus(project.status), // Map construction status to base status
        budgetKes: project.budget.totalBudget,
        location: project.location.address,
        completionPercentage: project.progress.overallPercentage,
        clientId: project.clientId,
        managerId: project.managerId,
        teamIds: [],
        startDate: project.timeline.plannedStart,
        endDate: project.timeline.plannedEnd,
        priority: project.priority,
        tags: [],
        attachments: [],
        milestones: [],
      };

      const response = await secureDb.createProject(baseProject);
      if (response.success && response.data) {
        // Transform back to ConstructionProject format
        return {
          ...project,
          id: response.data.id,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to create construction project:', error);
      return null;
    }
  }

  async updateProject(id: string, updates: Partial<ConstructionProject>): Promise<ConstructionProject | null> {
    try {
      // Use the base project update method
      const baseUpdates = {
        title: updates.name,
        description: updates.description,
        status: updates.status ? this.mapToBaseStatus(updates.status) : undefined,
        location: updates.location?.address,
        budgetKes: updates.budget?.totalBudget,
        completionPercentage: updates.progress?.overallPercentage,
      };
      
      const response = await secureDb.updateProject(id, baseUpdates);
      if (response.success && response.data) {
        return await this.getProject(id); // Return the updated construction project
      }
      return null;
    } catch (error) {
      console.error('Failed to update construction project:', error);
      return null;
    }
  }

  // Mock methods for advanced features (would be implemented with real APIs in production)
  async getWeatherData(projectId: string, days: number = 7): Promise<WeatherData[]> {
    // Mock weather data
    const mockData: WeatherData[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockData.push({
        timestamp: date.toISOString(),
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        windSpeed: Math.random() * 20,
        precipitation: Math.random() * 10,
        conditions: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)]
      });
    }
    return mockData;
  }

  async getSensorData(projectId: string): Promise<SensorReading[]> {
    // Mock sensor data
    const mockSensors: SensorReading[] = [
      {
        id: '1',
        sensorId: 'temp_01',
        type: 'temperature',
        value: 25.5,
        unit: '°C',
        timestamp: new Date().toISOString(),
        location: 'Site A - Zone 1'
      },
      {
        id: '2',
        sensorId: 'hum_01',
        type: 'humidity',
        value: 65,
        unit: '%',
        timestamp: new Date().toISOString(),
        location: 'Site A - Zone 1'
      }
    ];
    return mockSensors;
  }

  async getAlerts(projectId: string, status?: string): Promise<ProjectAlert[]> {
    // Mock alerts data
    const mockAlerts: ProjectAlert[] = [
      {
        id: '1',
        projectId,
        type: 'safety',
        severity: 'warning',
        title: 'Safety Equipment Check Required',
        message: 'Monthly safety equipment check is due for Site A',
        triggeredAt: new Date().toISOString()
      }
    ];
    return status ? mockAlerts.filter(alert => !alert.acknowledgedAt) : mockAlerts;
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    // Mock implementation
    console.log(`Alert ${alertId} acknowledged`);
    return true;
  }
}

// Singleton instance
export const constructionTracker = new ConstructionTracker();

export default constructionTracker;