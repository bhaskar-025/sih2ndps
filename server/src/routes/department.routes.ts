import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';

const router = Router();

// Route group: /api/v1/departments
router.get('/', DepartmentController.getAllDepartments);
router.get('/:id', DepartmentController.getDepartmentById);
router.post('/', DepartmentController.createDepartment);
router.put('/:id', DepartmentController.updateDepartment);
router.delete('/:id', DepartmentController.deleteDepartment);

export default router;
