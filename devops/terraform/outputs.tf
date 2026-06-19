output "db_endpoint" {
  value = aws_db_instance.mysql.address
}

output "db_port" {
  value = aws_db_instance.mysql.port
}

output "db_url" {
  value     = "mysql+pymysql://${var.db_username}:${var.db_password}@${aws_db_instance.mysql.address}:${aws_db_instance.mysql.port}/${var.db_name}"
  sensitive = true
}
