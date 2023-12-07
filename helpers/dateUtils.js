module.exports={
    getDailyDateRange: function() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        return { $gte: today, $lte: endOfDay };
    },
    

    getWeeklyDateRange:function(){
        const today=new Date();
        const startOfWeek=new Date(today);
        startOfWeek.setDate(today.getDate()-today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate()+7)
        return {$gte: startOfWeek, $lt:endOfWeek}

    },


    getYearlyDateRange:function(){
        const today=new Date();
        const startOfYear=new Date(today.getFullYear(),0,1)
        startOfYear.setHours(0, 0, 0, 0);
        const endOfYear=new Date(startOfYear);
        endOfYear.setFullYear(startOfYear.getFullYear()+1);
        return{$gte: startOfYear,$lt:endOfYear}
    }
}