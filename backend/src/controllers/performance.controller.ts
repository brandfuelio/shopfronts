import { Request, Response } from 'express';
import { PerformanceService } from '../services/performance.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

export class PerformanceController {
  /**
   * Get performance analysis
   */
  static getAnalysis = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const analysis = await PerformanceService.analyzePerformance();

    res.json({
      success: true,
      data: analysis,
    });
  });

  /**
   * Get performance report
   */
  static getReport = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const report = await PerformanceService.generateReport();

    res.json({
      success: true,
      data: report,
    });
  });

  /**
   * Run auto-optimization
   */
  static runOptimization = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const actions = await PerformanceService.autoOptimize();

    res.json({
      success: true,
      data: {
        actions,
        timestamp: new Date(),
      },
    });
  });

  /**
   * Benchmark endpoint
   */
  static benchmarkEndpoint = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { endpoint, method = 'GET' } = req.body;

    if (!endpoint) {
      throw new AppError('Endpoint is required', 400);
    }

    const results = await PerformanceService.benchmarkEndpoint(endpoint, method);

    res.json({
      success: true,
      data: results,
    });
  });

  /**
   * Get slow queries
   */
  static getSlowQueries = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const threshold = parseInt(req.query.threshold as string) || 1000;
    const queries = await PerformanceService.getSlowQueries(threshold);

    res.json({
      success: true,
      data: queries,
    });
  });

  /**
   * Detect memory leaks
   */
  static detectMemoryLeaks = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const result = await PerformanceService.detectMemoryLeaks();

    res.json({
      success: true,
      data: result,
    });
  });
}