pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                script {
                    if (isUnix()) {
                        sh 'echo "Build stage completed on Unix"'
                    } else {
                        bat 'echo Build stage completed on Windows'
                    }
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                script {
                    if (isUnix()) {
                        sh 'echo "Test stage completed on Unix"'
                    } else {
                        bat 'echo Test stage completed on Windows'
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Build successful! All stages passed.'
        }
        failure {
            echo 'Build failed!'
        }
    }
}