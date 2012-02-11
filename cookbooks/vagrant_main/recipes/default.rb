require_recipe "apt"
require_recipe "build-essential"
require_recipe "rvm::vagrant"
require_recipe "rvm::system"

gem_packages = ['jekyll', 'rake', 'bundler']

gem_packages.each do |pkg|
  rvm_gem pkg do
    ruby_string "ruby-1.9.2-p290"
    action      :install
  end
end

require_recipe "python"
easy_install_package "Pygments" do
  action :install
end

# s = "brightwrap"
# site = {
#   :name => s, 
#   :host => "www.#{s}.local", 
#   :aliases => ["#{s}.local", "dev.#{s}-static.local"]
# }

# # Configure the development site
# web_app site[:name] do
#   template "sites.conf.erb"
#   server_name site[:host]
#   server_aliases site[:aliases]
#   docroot "/vagrant/"
# end  

# # Add site info in /etc/hosts
# bash "info_in_etc_hosts" do
#   code "echo 127.0.0.1 #{site[:host]} #{site[:aliases].join(" ")} >> /etc/hosts"
# end

# trust rvmrc
open("/home/vagrant/.rvmrc", 'a') do |f|
  f.puts "\nexport rvm_trust_rvmrcs_flag=1"
end

# bundle
execute "bundle" do
  command "cd /vagrant && bundle install"
  action :run
  ignore_failure false
end

# rake
execute "rake" do
  command "cd /vagrant && rake install"
  action :run
  ignore_failure false
end