pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS' // 플러그인에 설정한 이름과 동일하게 지정
    }
    
    environment { // credentials 설정
        HOST_IP = credentials('HOST-IP')
        HOST_NAME = "ubuntu"
        HOST_PASSWORD = credentials('HOST_PASSWORD')
        
        HARBOR_URL = credentials('harbor-url')
        
        GITHUB_TOKEN = credentials('GitHub_Token')
        GIT_USERNAME = "kcs19"
        
        // 레포지토리 디렉토리 경로 설정
        FRONTEND_DIR = "CloBee-frontend"
        REACT_BUILD_DIR = "/var/appdir/frontend"
        CD_DIR = "CloBee-CD"
    }
    
    stages {
        stage('Prepare Workspace') {
            steps {
                // 기존 디렉토리 정리 (선택 사항)
                sh """
                rm -rf ${FRONTEND_DIR} ${CD_DIR}
                mkdir -p ${FRONTEND_DIR} ${CD_DIR}
                """
            }
        }
        
        stage('Checkout Frontend') {
            steps {
                // 프론트엔드 레포지토리를 지정한 디렉토리로 체크아웃
                dir(FRONTEND_DIR) {
                    git branch: 'feat/map', 
                        url: 'https://github.com/4ourClover/CloBee-frontend.git'
                }
            }
        }
        
        stage('Build React App') {
            steps {
                // 프론트엔드 디렉토리에서 빌드
                dir(FRONTEND_DIR) {
                    sh "npm install"
                    sh "CI=false npm run build"
                    sh "mkdir -p ${REACT_BUILD_DIR}"
                    sh "cp -r build/* ${REACT_BUILD_DIR}"
                    sh "ls -al ${REACT_BUILD_DIR}"
                }
            }
        }
        
        stage('copy dockerfile'){
            steps {
                dir(FRONTEND_DIR) {
                    sh "cp Dockerfile ${REACT_BUILD_DIR}"
                    sh "ls ${REACT_BUILD_DIR}"
                }
            }
        }
        
        stage('Build Docker Image and Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-credentials', 
                                                  usernameVariable: 'HARBOR_USER', 
                                                  passwordVariable: 'HARBOR_PASS')]) {
                    sh """
                        sshpass -p ${HOST_PASSWORD} ssh -o StrictHostKeyChecking=no ${HOST_NAME}@${HOST_IP} '
                        cd /home/ubuntu/appdir/frontend &&
                        echo ${HARBOR_PASS} | docker login ${HARBOR_URL} -u ${HARBOR_USER} --password-stdin &&
                        docker build -t ${HARBOR_URL}/library/react-app:${BUILD_NUMBER} . &&
                        docker push ${HARBOR_URL}/library/react-app:${BUILD_NUMBER}
                        '
                    """
                }
            }
        }
        
        
        stage('Checkout CD Repository') {
            steps {
                // CD 레포지토리를 별도 디렉토리로 체크아웃
                dir(CD_DIR) {
                    git branch: 'main', 
                        url: 'https://github.com/4ourClover/CloBee-CD.git',
                        credentialsId: 'GitHub_Token'  // 자격 증명 사용 (선택 사항)
                    sh "ls -la"  // 체크아웃 확인
                }
            }
        }
        
        stage('Make Changes to CD Repository') {
            steps {
                // CD 레포지토리 디렉토리에서 작업
                dir(CD_DIR) {
                    // Git 설정
                    sh """
                        ls -la ./nodes/frontend/ || echo "frontend directory not found"
                    
                        sed -i 's|image: .*react-app:.*|image: clobee-harbor.shop/library/react-app:${BUILD_NUMBER}|' ./nodes/frontend/react-deployment.yaml
                    
                        cat ./nodes/frontend/react-deployment.yaml
                    """
                }
            }
        }
        
        stage('Commit and Push CD Repository') {
            steps {
                // CD 레포지토리 디렉토리에서 작업
                dir(CD_DIR) {
                    sh """
                    git config user.name "Jenkins Bot"
                    git config user.email "jenkins@clobee.io"
                    
                    git add .
                    
                    # 변경사항이 있는지 확인하고 커밋
                    git diff --staged --quiet || git commit -m "fix : react.yaml version change"
                    
                    git push https://${GIT_USERNAME}:${GITHUB_TOKEN}@github.com/4ourClover/CloBee-CD.git main
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo "Build completed"
        }
        success {
            echo "Build succeeded!"
        }
        failure {
            echo "Build failed!"
        }
    }
}