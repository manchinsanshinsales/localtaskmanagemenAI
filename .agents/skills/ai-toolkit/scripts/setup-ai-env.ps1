param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("writing", "coding", "analysis")]
    [string]$Type,

    [string]$TargetDir = $PWD
)

Write-Host "Deploying AI Prompt Template for Type: $Type to $TargetDir ..."

$ScriptDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($ScriptDir)) {
    if ($MyInvocation -and $MyInvocation.MyCommand -and $MyInvocation.MyCommand.Path) {
        $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
}
if ([string]::IsNullOrEmpty($ScriptDir)) {
    $SkillResourcesDir = "C:\Users\test\Documents\antigravity\fearless-salk\.agents\skills\ai-toolkit\resources"
} else {
    $SkillResourcesDir = [System.IO.Path]::GetFullPath((Join-Path $ScriptDir "../resources"))
}

$TemplateFile = Join-Path $SkillResourcesDir "$Type.prompt.md"
$DestinationFile = Join-Path $TargetDir "PROMPT_TEMPLATE.md"

if (-not (Test-Path $TemplateFile)) {
    Write-Error "Template file not found: $TemplateFile"
    exit 1
}

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir | Out-Null
}

Copy-Item -Path $TemplateFile -Destination $DestinationFile -Force
Write-Host "PROMPT_TEMPLATE.md deployed successfully for $Type."
