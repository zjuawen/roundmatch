#!/bin/bash

# PM2 启动脚本 - 管理台

set -e

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}RoundMatch 管理台 PM2 启动脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}错误: PM2 未安装${NC}"
    echo "请先安装 PM2: npm install -g pm2"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 检查参数
MODE=${1:-dev}

cd "$PROJECT_ROOT/admin"

if [ "$MODE" = "prod" ]; then
    echo -e "${YELLOW}使用生产环境配置...${NC}"
    CONFIG_FILE="ecosystem.prod.config.cjs"
    
    # 生产环境需要先构建
    echo -e "${YELLOW}构建管理台...${NC}"
    if [ ! -d "node_modules" ]; then
        echo "安装管理台依赖..."
        npm install
    fi
    echo "构建管理台静态文件..."
    npm run build
else
    echo -e "${YELLOW}使用开发环境配置...${NC}"
    CONFIG_FILE="ecosystem.config.cjs"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "安装管理台依赖..."
        npm install
    fi
fi

# 停止已存在的进程
echo -e "${YELLOW}停止已存在的管理台进程...${NC}"
pm2 delete roundmatch-admin 2>/dev/null || true

# 启动应用
echo -e "${GREEN}启动管理台...${NC}"
pm2 start "$CONFIG_FILE"

# 保存 PM2 进程列表
pm2 save

# 显示状态
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}管理台启动完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "常用命令："
echo "  pm2 status roundmatch-admin      # 查看状态"
echo "  pm2 logs roundmatch-admin        # 查看日志"
echo "  pm2 restart roundmatch-admin     # 重启管理台"
echo "  pm2 stop roundmatch-admin        # 停止管理台"
echo "  pm2 delete roundmatch-admin      # 删除管理台"
echo ""
echo "查看详细状态："
pm2 show roundmatch-admin
