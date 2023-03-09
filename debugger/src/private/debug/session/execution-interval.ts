/** Specifies the scope of the iteration to be completed by the computer before returning to its idle state */
export enum ExecutionInterval {
    /** A single pipeline stage will be completed */
    PipelineStage,

    /** Each stage of the pipeline will be completed */
    PipelineCycle,

    /** The pipeline will be cycled indefinitely until an end condition is met or executon is halted manually */
    Continuous
}