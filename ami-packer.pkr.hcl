packer{
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}
variable "AWS_ACCESS_KEY" {
  type = string
  default = ""
}

variable "AWS_SECRET_ACCESS_KEY" {
  type = string
  default = ""
}
variable "AWS_REGION" {
  type = string
  default = "us-east-1"
}
variable "AMI_USER" {
  type = string
  default= "${env("AMI_USER")}"
}

locals {
  timestamp = regex_replace(timestamp(), "[- TZ:]", "")
}
source "amazon-ebs" "webapp" {
  ami_name = "webapp-${local.timestamp}"

  source_ami_filter {
    filters = {
      name                = "amzn2-ami-hvm-2.*.1-x86_64-gp2"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }


  instance_type = "t2.micro"
  region = var.AWS_REGION
  ssh_username = "ec2-user"
  ami_users = [var.AMI_USER]
  access_key = var.AWS_ACCESS_KEY
  secret_key = var.AWS_SECRET_ACCESS_KEY
}
build {
  sources = [
    "source.amazon-ebs.webapp"
  ]

  provisioner "file" {
    source = "webapp.zip"
    destination = "~/"
  }

  provisioner "shell" {
    script = "./app.sh"
  }
}
