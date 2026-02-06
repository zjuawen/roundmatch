#!/bin/bash

# PM2 启动脚本 - 服务端

set -e

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT/server"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}RoundMatch 服务端 PM2 启动脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}错误: PM2 未安装${NC}"
    echo "请先安装 PM2: npm install -g pm2"
    exit 1
fi

# 创建日志目录
mkdir -p ../logs

# 检查依赖
echo -e "${YELLOW}检查服务端依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "安装服务端依赖..."
    npm install
fi

# 停止已存在的进程
echo -e "${YELLOW}停止已存在的服务端进程...${NC}"
pm2 delete roundmatch-server 2>/dev/null || true

# 启动应用
echo -e "${GREEN}启动服务端...${NC}"
pm2 start ecosystem.config.js

# 保存 PM2 进程列表
pm2 save

# 显示状态
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}服务端启动完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "常用命令："
echo "  pm2 status roundmatch-server     # 查看状态"
echo "  pm2 logs roundmatch-server       # 查看日志"
echo "  pm2 restart roundmatch-server    # 重启服务端"
echo "  pm2 stop roundmatch-server        # 停止服务端"
echo "  pm2 delete roundmatch-server     # 删除服务端"
echo ""
echo "查看详细状态："
pm2 show roundmatch-server
