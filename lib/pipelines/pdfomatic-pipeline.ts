import { pipelines, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm"
import { PdfOMaticStage } from "../pdfomatic";

export class PdfOMaticPipeline extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
            pipelineName: "PdfOMatic",
            synth: new pipelines.ShellStep('Synth', {
                // Use a connection created using the AWS console to authenticate to GitHub
                // Other sources are available.
                input: pipelines.CodePipelineSource.connection('JakeHendy/pdfomatic', 'main', {
                    connectionArn: StringParameter.fromStringParameterName(this, 'CodeConnectionArn', '/codestar/connections/pdfomatic').stringValue, // Created using the AWS console
                }),
                commands: [
                    'npm install',
                    'npm run build',
                    'npx cdk synth',
                ],
            }),
        });

        pipeline.addStage(
            new PdfOMaticStage(this, 'PdfOMaticDev')
        )
        
    }
}