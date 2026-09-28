import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Logger } from '../utils/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maitri_plus';

export const seedUsers = async (): Promise<void> => {
  try {
    Logger.info('Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGODB_URI);
    Logger.info('Connected to MongoDB.');

    const defaultUsers = [
      {
        name: 'System Admin',
        email: 'admin@maitri.com',
        password: 'Password' === 'Password' ? '12345678' : '12345678',
        role: 'admin',
        phone: '+91 9820011223',
        organization: 'Maharashtra State Administration',
        department: 'IT & Single Window Directorate',
        isActive: true,
      },
      {
        name: 'Nodal Officer',
        email: 'officer@maitri.com',
        password: 'Password' === 'Password' ? '12345678' : '12345678',
        role: 'officer',
        phone: '+91 9820044556',
        organization: 'Maharashtra Pollution Control Board (MPCB)',
        department: 'Environmental Clearance Wing',
        isActive: true,
      },
      {
        name: 'Rajesh Sharma',
        email: 'raj@industries.com',
        password: 'Password' === 'Password' ? '12345678' : '12345678',
        role: 'entrepreneur',
        phone: '+91 9820077889',
        organization: 'Raj Industrial Polymers & Green Energy Ltd',
        department: 'Manufacturing',
        isActive: true,
      },
    ];

    let rajUser: any = null;

    for (const userData of defaultUsers) {
      await User.deleteOne({ email: userData.email.toLowerCase() });

      const user = new User({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
        organization: userData.organization,
        department: userData.department,
        isActive: userData.isActive,
      });

      await user.save();
      Logger.info(`✓ Successfully created user: ${userData.email} (Role: ${userData.role})`);

      if (userData.email === 'raj@industries.com') {
        rajUser = user;
      }
    }

    // Drop any stale unique indexes on projects collection from older schema
    try {
      await mongoose.connection.collection('projects').dropIndexes();
    } catch {
      // ignore if collection doesn't exist
    }

    // Seed sample Industrial Projects for Rajesh Sharma
    if (rajUser) {
      await Project.deleteMany({ owner: rajUser._id });

      const sampleProjects = [
        {
          projectName: 'Green Bio-Ethanol Refinement & Co-Gen Facility',
          companyName: 'Raj Industrial Polymers & Green Energy Ltd',
          industry: 'Renewable Energy & Biofuels',
          projectType: 'Greenfield',
          location: 'Plot No. B-42, Baramati MIDC Industrial Zone',
          district: 'Pune',
          taluka: 'Baramati',
          village: 'Katphal',
          investment: 14500, // ₹145 Cr
          landArea: 35.5,    // 35.5 Acres
          employees: 320,
          waterRequirement: 450, // 450 KLD
          powerRequirement: 2500, // 2500 KW
          pollutionCategory: 'Orange' as const,
          projectStage: 'Clearance_In_Progress' as const,
          status: 'Under_Review' as const,
          owner: rajUser._id,
          isDeleted: false,
        },
        {
          projectName: 'Precision EV Battery Module Assembly Plant',
          companyName: 'Raj Industrial Polymers & Green Energy Ltd',
          industry: 'Electric Mobility & Electronics',
          projectType: 'Expansion',
          location: 'Phase-2 Chakan MIDC Industrial Corridor',
          district: 'Pune',
          taluka: 'Khed',
          village: 'Mahalunge',
          investment: 8200, // ₹82 Cr
          landArea: 18.0,   // 18 Acres
          employees: 180,
          waterRequirement: 120, // 120 KLD
          powerRequirement: 1800, // 1800 KW
          pollutionCategory: 'Green' as const,
          projectStage: 'Planning' as const,
          status: 'Approved' as const,
          owner: rajUser._id,
          isDeleted: false,
        },
      ];

      for (const p of sampleProjects) {
        const proj = new Project(p);
        await proj.save();
        Logger.info(`✓ Seeded industrial project: ${proj.projectName} (District: ${proj.district})`);
      }
    }

    Logger.info('✨ User & Project seeding completed successfully.');
    await mongoose.disconnect();
    Logger.info('Disconnected from MongoDB.');
  } catch (error: any) {
    Logger.error(`Failed to seed users: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedUsers().then(() => process.exit(0));
}

export default seedUsers;
