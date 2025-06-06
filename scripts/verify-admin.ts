import { storage } from "../server/storage";
import { hashPassword } from "../server/utils/password";

async function verifyAdmin() {
  try {
    // Check if admin exists
    let admin = await storage.getUserByEmail('admin@registry.gov.gh');
    
    if (!admin) {
      console.log('Admin user not found. Creating...');
      const hashedPassword = await hashPassword('Admin@123');
      admin = await storage.upsertUser({
        id: 'admin-001',
        email: 'admin@registry.gov.gh',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user exists. Updating role and verification status...');
      // Update admin role and verification status
      const hashedPassword = admin.password; // Keep existing password
      admin = await storage.upsertUser({
        ...admin,
        role: 'admin',
        isVerified: true,
        password: hashedPassword
      });
      console.log('Admin user updated successfully');
    }

    console.log('Admin user details:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified,
      firstName: admin.firstName,
      lastName: admin.lastName
    });

    // Verify the role is set correctly
    const verifiedAdmin = await storage.getUserByEmail('admin@registry.gov.gh');
    if (verifiedAdmin?.role !== 'admin') {
      throw new Error('Admin role not set correctly');
    }
    console.log('Admin role verified successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAdmin(); 