-- CreateTable
CREATE TABLE "ScheduledJobRun" (
    "jobName" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledJobRun_pkey" PRIMARY KEY ("jobName","scheduledFor")
);
