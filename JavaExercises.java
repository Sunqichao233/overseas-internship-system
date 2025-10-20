import java.util.Arrays;

// 問題1: 配列操作 - データ集計
class PriceCalculator {
    public int calculateTotal(int[] prices) {
        int total = 0;
        for (int i = 0; i < prices.length; i++) {
            total += prices[i];
        }
        return total;
    }
}

// 問題2: オブジェクトとループ - 社員データフィルタリング
class Employee {
    private String name;
    private int yearsOfExperience;
    
    public Employee(String name, int yearsOfExperience) {
        this.name = name;
        this.yearsOfExperience = yearsOfExperience;
    }
    
    public String getName() {
        return name;
    }
    
    public int getYearsOfExperience() {
        return yearsOfExperience;
    }
}

class EmployeeManager {
    public void filterEmployees(Employee[] employees) {
        int i = 0;
        while (i < employees.length) {
            if (employees[i].getYearsOfExperience() > 2) {
                System.out.println(employees[i].getName());
            }
            i++;
        }
    }
}

// 問題3: 配列ソートとオブジェクト比較
class Task implements Comparable<Task> {
    private int priority;
    
    public Task(int priority) {
        this.priority = priority;
    }
    
    public int getPriority() {
        return priority;
    }
    
    @Override
    public int compareTo(Task other) {
        return Integer.compare(this.priority, other.priority);
    }
}

class TaskManager {
    public void sortTasks(Task[] tasks) {
        Arrays.sort(tasks);
        for (int i = 0; i < tasks.length; i++) {
            System.out.println(tasks[i].getPriority());
        }
    }
}

// メインクラス - テスト用
public class JavaExercises {
    public static void main(String[] args) {
        // 問題1のテスト
        System.out.println("問題1: 配列操作 - データ集計");
        PriceCalculator calculator = new PriceCalculator();
        int[] prices = {100, 200, 150, 300, 250};
        int total = calculator.calculateTotal(prices);
        System.out.println("合計: " + total); // 期待出力: 1000
        
        System.out.println("\n問題2: オブジェクトとループ - 社員データフィルタリング");
        EmployeeManager manager = new EmployeeManager();
        Employee[] employees = {
            new Employee("Alice", 1),
            new Employee("Bob", 3),
            new Employee("Charlie", 2)
        };
        manager.filterEmployees(employees); // 期待出力: Bob
        
        System.out.println("\n問題3: 配列ソートとオブジェクト比較");
        TaskManager taskManager = new TaskManager();
        Task[] tasks = {
            new Task(3),
            new Task(1),
            new Task(2)
        };
        taskManager.sortTasks(tasks); // 期待出力: 1, 2, 3（各行）
    }
}