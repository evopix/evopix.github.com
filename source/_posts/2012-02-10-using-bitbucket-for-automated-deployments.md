---
title: "Using Bitbucket for Automated Deployments"
date: 2012-02-10 17:01
comments: true
tags:
    - bitbucket
    - git
    - php
categories:
    - webdev
    - workflow
---

There are many different ways to handle deployments, but I have become very fond of using Bitbucket's [service hooks](http://confluence.atlassian.com/display/BITBUCKET/Managing+bitbucket+Services). In this case we're going to be using the [POST service hook](http://confluence.atlassian.com/display/BITBUCKET/Setting+Up+the+bitbucket+POST+Service), which is basically a git post-receive hook that sends a POST request to a given url every time you push to your repository.

*Note: This is a really simple and effecient way to handle deployments for smaller projects (e.g. Static websites, Wordpress, etc.), but if your project is any bigger than those you should really be using a [CI server](http://en.wikipedia.org/wiki/Continuous_integration) to push out deployments.*

Work flow
--------

1. Commit changes and push them up to your Bitbucket repository
2. Bitbucket sends a `POST` request to a deployment script on your server
3. The deployment script pulls changes into it's local repository (which is in the web-root) which updates the website
4. Repeat

<!-- more -->

Setting up the Server
---------------------
To get started you'll need to create a clone of your projects git repository that's hosted on Bitbucket.

*Note: If your repository is private you'll need to [create a public/private key pair on your server and add it to your Bitbucket account](http://confluence.atlassian.com/display/BITBUCKET/Set+up+SSH+for+Git). If you don't do this your server won't be able to connect with Bitbucket.*

``` sh
cd /var/www/foobar.com
git clone git@bitbucket.org:baz/foobar.com.git .
```

Creating the Deployment Script
------------------------------

Create a php file named `deploy.php` and add the following code to it. 

``` php
<?php

date_default_timezone_set('America/Los_Angeles');

class Deploy {

    /**
     * A callback function to call after the deploy has finished.
     * 
     * @var callback
     */
    public $post_deploy;
    
    /**
     * The name of the file that will be used for logging deployments. Set to 
     * FALSE to disable logging.
     * 
     * @var string
     */
    private $_log = 'deployments.log';

    /**
     * The timestamp format used for logging.
     * 
     * @link    http://www.php.net/manual/en/function.date.php
     * @var     string
     */
    private $_date_format = 'Y-m-d H:i:sP';

    /**
     * The name of the branch to pull from.
     * 
     * @var string
     */
    private $_branch = 'master';

    /**
     * The name of the remote to pull from.
     * 
     * @var string
     */
    private $_remote = 'origin';

    /**
     * The directory where your website and git repository are located, can be 
     * a relative or absolute path
     * 
     * @var string
     */
    private $_directory;

    /**
     * Sets up defaults.
     * 
     * @param  string  $directory  Directory where your website is located
     * @param  array   $data       Information about the deployment
     */
    public function __construct($directory, $options = array())
    {
        // Determine the directory path
        $this->_directory = realpath($directory).DIRECTORY_SEPARATOR;

        $available_options = array('log', 'date_format', 'branch', 'remote');

        foreach ($options as $option => $value)
        {
            if (in_array($option, $available_options))
            {
                $this->{'_'.$option} = $value;
            }
        }

        $this->log('Attempting deployment...');
    }

    /**
     * Writes a message to the log file.
     * 
     * @param  string  $message  The message to write
     * @param  string  $type     The type of log message (e.g. INFO, DEBUG, ERROR, etc.)
     */
    public function log($message, $type = 'INFO')
    {
        if ($this->_log)
        {
            // Set the name of the log file
            $filename = $this->_log;

            if ( ! file_exists($filename))
            {
                // Create the log file
                file_put_contents($filename, '');

                // Allow anyone to write to log files
                chmod($filename, 0666);
            }

            // Write the message into the log file
            // Format: time --- type: message
            file_put_contents($filename, date($this->_date_format).' --- '.$type.': '.$message.PHP_EOL, FILE_APPEND);
        }
    }

    /**
     * Executes the necessary commands to deploy the website.
     */
    public function execute()
    {
        try
        {
            // Make sure we're in the right directory
            exec('cd '.$this->_directory, $output);
            $this->log('Changing working directory... '.implode(' ', $output));

            // Discard any changes to tracked files since our last deploy
            exec('git reset --hard HEAD', $output);
            $this->log('Reseting repository... '.implode(' ', $output));

            // Update the local repository
            exec('git pull '.$this->_remote.' '.$this->_branch, $output);
            $this->log('Pulling in changes... '.implode(' ', $output));

            // Secure the .git directory
            exec('chmod -R og-rx .git');
            $this->log('Securing .git directory... ');

            if (is_callable($this->post_deploy))
            {
                call_user_func($this->post_deploy, $this->_data);
            }

            $this->log('Deployment successful.');
        }
        catch (Exception $e)
        {
            $this->log($e, 'ERROR');
        }
    }

}

// This is just an example
$deploy = new Deploy('/var/www/foobar.com');

$deploy->post_deploy = function() use ($deploy) {
    // hit the wp-admin page to update any db changes
    exec('curl http://www.foobar.com/wp-admin/upgrade.php?step=upgrade_db');
    $deploy->log('Updating wordpress database... ');
};

$deploy->execute();

?>
```

Most of the code is self-explanatory, but I'll go ahead and explain a few key pieces.

``` php
<?php date_default_timezone_set('America/Los_Angeles');
```

If you set the `date.timezone` value in your `php.ini` file then you can safely remove this line, otherwise you should set it to your [local timezone](http://www.php.net/manual/en/timezones.php).

```
<?php exec('git reset --hard HEAD', $output);
```

This tells git to remove any changes to files in the working-tree since the last `git pull`. If we don't do this and the working-tree is dirty then the deploy will fail.

```
<?php exec('git pull '.$this->_remote.' '.$this->_branch, $output);
```

This just pulls in all new code from the remote and branch specified (defaults to `origin` remote and `master` branch).

```
<?php exec('chmod -R og-rx .git', $output);
```

Since the git repository is in the web root users could potentially view it's contents. This command modifies the permissions of all files in the `.git` directory so that only the file owner (you) can access them.

Configuring the Script
----------------------

Most of the script defaults should work fine for the majority of users, but you will need to pass in the path to your web-root as the first parameter when creating the `Deploy` object. All of the other options can be configured by passing an array of values as the second parameter when creating the `Deploy` object.

**Option Defaults**

``` php
<?php

$options = array(
    'log' => 'deployments.log',
    'date_format' => 'Y-m-d H:i:sP',
    'branch' => 'master',
    'remote' => 'origin',
);
```

Post Deploy
-----------

If you need to do something after a deployment you can do so by adding a callback to the `Deploy` object before executing. By attaching the callback to the `Deploy` object you ensure the code only gets run if the deployment is successful.

**Example**
```
<?php

$deploy->post_deploy = function() use ($deploy) {
    // hit the wp-admin page to update any db changes
    exec('curl http://www.foobar.com/wp-admin/upgrade.php?step=upgrade_db');
    $deploy->log('Updating wordpress database... ');
};
```
*Note: This example will only work on PHP 5.3+ because it [uses a closure](http://php.net/manual/en/functions.anonymous.php). If your not on PHP 5.3 you will have to use a [traditional callback](http://php.net/manual/en/language.pseudo-types.php).

Setting Up the Service Hook
---------------------------

Once you've finished configuring your deploy script, go ahead and upload it to your servers web-root.

The next step is pretty straightforward, so I'm just going to [point you directly to the documentation](http://confluence.atlassian.com/display/BITBUCKET/Setting+Up+the+bitbucket+POST+Service).

Now test it out and enjoy your painless automated deployments!

Taking it a Step Further
---------------------------

The script I've written updates the server's repository regardless of whether or not the changes were made to the `master` branch (or whatever branch is your production branch). This works fine because it will only pull in changes from that branch anyway, but it would be nice if it would check what branch the changes are from and act accordingly.

Well, the good news is Bitbucket is [kind enough to send along a bunch of data](http://confluence.atlassian.com/display/BITBUCKET/Setting+Up+the+bitbucket+POST+Service#SettingUpthebitbucketPOSTService-POSTData) with the `POST` request which includes a list of all commits and their branch. It should be fairly easy to modify the script to check this data and only pull in changes if they are on your production branch.

What About Github?
------------------

Although I wrote the script for Bitbucket it should work with any git hosting providers as long as the have some sort of service hooks (which Github does, yay!).