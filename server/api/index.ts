import { Request, Response } from 'express';
import { ReadWriteController } from './read-write-controller';
import { ContactUsController } from './contact-us-controller';
import { ContactUsAdminService } from './admin-services/contact-us'
import { getValidator } from '../types/endpointSchemaMap';
 
const router = require('express').Router();
import navItems from '../config/navbar.json';
import footer from '../config/footer.json';

router.get('/data', (req: Request, res: Response) => {
  ReadWriteController.getJSONDataPath(req.query.path, res);
})

router.post('/data', (req: Request, res: Response) => {
  const validator = getValidator(req.query.path);
  if(validator) {
    if(validator(req.body)) {
      ReadWriteController.overwriteJSONDataPath(req.query.path, res, req.body);
    } else {
      res.status(401).end();
    }
  } else {
    res.status(401).end();
  }
})

router.get('/data/:fileName', (req: Request, res: Response) => {
  ReadWriteController.getJSONData(req.params.fileName, res);
});

router.post('/data/:fileName', (req: Request, res: Response) => {
  ReadWriteController.overwriteJSONData(req.params.fileName, res, req.body);
});

router.post('/admin/contact-us/execs', (req: Request, res: Response) => {
  ContactUsAdminService.updateExecs(req, res);
});

router.post('/general-inquiries', (req: Request, res: Response) => {
  const success = ContactUsController.handleRequest(req, res);
  // If the res hasn't been closed by bad input, then redirect to success page
  if (success) {
    res.render('pages/contact-us/contact-us-success', { navItems: navItems, footer: footer });
  }
});

export default router;
