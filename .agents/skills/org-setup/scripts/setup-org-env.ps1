param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("executive", "data-engineer", "sier-se")]
    [string]$Role,

    [string]$TargetDir = $PWD
)

# 1. Git config global aliases
Write-Host "Configuring global Git aliases..."
git config --global alias.st "status"
git config --global alias.co "checkout"
git config --global alias.br "branch"
git config --global alias.ci "commit"
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
Write-Host "Git aliases configured successfully."

# 2. Deploy role-specific AGENTS.md
$SkillResourcesDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../resources"))
$TemplateFile = Join-Path $SkillResourcesDir "AGENTS.$Role.md.template"
$DestinationFile = Join-Path $TargetDir "AGENTS.md"


if (-not (Test-Path $TemplateFile)) {

    Write-Error "Template file not found: $TemplateFile"
    exit 1
}

Write-Host "Deploying AGENTS.md for Role: $Role to $TargetDir ..."
if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir | Out-Null
}

Copy-Item -Path $TemplateFile -Destination $DestinationFile -Force
Write-Host "AGENTS.md deployed successfully."
