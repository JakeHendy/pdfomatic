#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PdfOMaticPipeline } from '../lib/pipelines/pdfomatic-pipeline';

const app = new cdk.App();
new PdfOMaticPipeline(app, 'PdfOMaticPipeline')