
/**
 * TripInformationForm component collects trip details for a reimbursement proposal.
 *
 * Props:
 *  - formData: Current trip information state
 *  - setFormData: State setter for updating trip information
 *
 * Features:
 *  - Inputs for trip purpose, location, dates, department, and type
 *  - Department options are provided as a constant
 *  - Used as a sub-form in proposal creation/editing
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';


// Props for TripInformationForm
interface TripInformationFormProps {
  formData: {
    tripPurpose: string;
    tripLocation: string;
    startDate: string;
    endDate: string;
    department: string;
    tripType: string;
    multiCityDetails?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}


// Department options for dropdown
const departments = [
  'Sales',
  'Marketing',
  'Engineering',
  'HR',
  'Finance',
];

export const TripInformationForm: React.FC<TripInformationFormProps> = ({ formData, setFormData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <span className="icon-[filetext] h-5 w-5 mr-2 text-[#5ABA47]" />
        Trip Information
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tripPurpose">Trip Purpose *</Label>
          <Input
            id="tripPurpose"
            value={formData.tripPurpose}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, tripPurpose: e.target.value }))}
            placeholder="e.g., Client meeting, Conference attendance"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <select
            id="department"
            value={formData.department}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, department: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#5ABA47] focus:outline-none focus:ring-1 focus:ring-[#5ABA47]"
          >
            {departments.map(dep => (
              <option value={dep} key={dep}>{dep}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="tripLocation">Trip Location *</Label>
        <Input
          id="tripLocation"
          value={formData.tripLocation}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, tripLocation: e.target.value }))}
          placeholder="e.g., San Francisco, CA"
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, startDate: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, endDate: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="tripType">Trip Type</Label>
          <select
            id="tripType"
            value={formData.tripType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tripType: e.target.value }))
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#5ABA47] focus:outline-none focus:ring-1 focus:ring-[#5ABA47]"
          >
            <option value="single">Single City</option>
            <option value="multi">Multi City</option>
          </select>
        </div>

        {formData.tripType === 'multi' && (
          <div>
            <Label htmlFor="multiCityDetails">Multi-City Details (Optional)</Label>
            <Input
              id="multiCityDetails"
              value={formData.multiCityDetails}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, multiCityDetails: e.target.value }))
              }
              placeholder="Briefly describe multi-city stops"
              className="mt-1"
            />
          </div>
        )}
      </div>

    </CardContent>
  </Card>
);
